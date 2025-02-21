import cluster, { Worker } from 'node:cluster';
import http from 'node:http';
import { ConfigSchemaType, rootConfigSchema } from './config-schema';
import { workerMessageReplySchema, WorkerMessageReplyType, workerMessageSchema, WorkerMessageType } from './server-schema';

interface CreateServerConfig {
    port: number;
    workerCount: number;
    config: ConfigSchemaType;
}

const activeConnections: Record<string, number> = {};
const workerRequestCount: Record<number, number> = {};
let isHealthCheckEnabled = false;
const upstreamHealthStatus: Record<string, boolean> = {};
const healthCheckRetryLimit = 3;
const healthCheckInterval = 30000;
const healthCheckTimeout = 5000;

export async function createServer(serverConfig: CreateServerConfig) {
    const { workerCount, port } = serverConfig;
    const WORKER_POOL: Worker[] = [];

    isHealthCheckEnabled = serverConfig.config.server.isHealthCheckEnabled ?? false;

    if (cluster.isPrimary) {
        console.log('Master Process is Up!');

        for (let i = 0; i < workerCount; i++) {
            const w = cluster.fork({ config: JSON.stringify(serverConfig.config) });
            WORKER_POOL.push(w);
            workerRequestCount[i] = 0;
            console.log(`Master Process: Worker Node Spinned Up ${i}`);
        }

        const server = http.createServer((req, res) => {
            const index = Math.floor(Math.random() * WORKER_POOL.length);
            const worker = WORKER_POOL.at(index);

            if (!worker) throw new Error('Worker not found');

            workerRequestCount[index]++;

            const payload: WorkerMessageType = {
                requestType: 'HTTP',
                headers: req.headers,
                body: null,
                url: `${req.url}`,
            };

            worker.send(JSON.stringify(payload));

            worker.once('message', async (workerReply: string) => {
                const reply = await workerMessageReplySchema.parseAsync(JSON.parse(workerReply));

                if (res.headersSent) return;

                if (reply.errorCode) {
                    res.writeHead(parseInt(reply.errorCode));
                    res.end(reply.error);
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(reply.data);
                }
            });

            showLoadBalancerStatus(WORKER_POOL.length);
        });

        server.listen(port, () => {
            console.log('Reverse Proxy Running on', port);
        });

        if (isHealthCheckEnabled) {
            setInterval(checkUpstreamHealth, healthCheckInterval, serverConfig.config.server.upstreams);
        }
    } else {
        console.log('Worker Node: Up');
        const config = await rootConfigSchema.parseAsync(JSON.parse(`${process.env.config}`));

        process.on('message', async (message: string) => {
            const messageValidated = await workerMessageSchema.parseAsync(JSON.parse(message));
            const requestURL = messageValidated.url;

            const rule = config.server.rules.find((e) => {
                const regex = new RegExp(`^${e.path}.*$`);
                return regex.test(requestURL);
            });

            if (!rule) {
                const reply: WorkerMessageReplyType = { errorCode: '404', error: 'Rule not found' };
                if (process.send) return process.send(JSON.stringify(reply));
            }

            const upstreamID = selectUpstream(rule?.upstreams ?? [], config.server.upstreams);
            const upstream = config.server.upstreams.find(e => e.id === upstreamID);

            if (!upstream) {
                const reply: WorkerMessageReplyType = { errorCode: '500', error: 'Upstream not found' };
                if (process.send) return process.send(JSON.stringify(reply));
            }

            activeConnections[upstreamID] = (activeConnections[upstreamID] || 0) + 1;
            console.log(`Selected Upstream: ${upstreamID} | Active Connections:`, activeConnections);

            const request = http.request({ host: upstream?.url, path: requestURL, method: 'GET' }, (proxyRes) => {
                let body = '';
                proxyRes.on('data', (chunk) => { body += chunk; });
                proxyRes.on('end', () => {
                    const reply: WorkerMessageReplyType = { data: body };
                    if (process.send) return process.send(JSON.stringify(reply));

                    activeConnections[upstreamID] = Math.max((activeConnections[upstreamID] || 1) - 1, 0);
                    console.log(`Updated Active Connections:`, activeConnections);
                });
            });

            request.end();
        });
    }
}

function selectUpstream(upstreamIDs: string[], upstreams: { id: string, url: string }[]): string {
    const availableUpstreams = upstreamIDs
        .map(id => upstreams.find(up => up.id === id))
        .filter((up): up is { id: string; url: string } => up !== undefined);

    const healthyUpstreams = availableUpstreams.filter(up => upstreamHealthStatus[up.id] !== false);

    if (healthyUpstreams.length === 0) {
        console.log('No healthy upstreams available!');
        return ''; 
    }

    const strategy = process.env.LOAD_BALANCE_STRATEGY || 'round_robin';

    if (strategy === 'round_robin') {
        return roundRobin(healthyUpstreams.map(up => up.id));
    } else if (strategy === 'least_connections') {
        return leastConnections(healthyUpstreams.map(up => up.id));
    } else {
        return healthyUpstreams[0]?.id ?? ''; 
    }
}

let rrIndex = 0;
function roundRobin(upstreamIDs: string[]): string {
    const selected = upstreamIDs[rrIndex % upstreamIDs.length];
    rrIndex++;
    console.log(`Round Robin Selected: ${selected}`);
    return selected;
}

function leastConnections(upstreamIDs: string[]): string {
    const selected = upstreamIDs.reduce((least, current) => {
        return (activeConnections[current] || 0) < (activeConnections[least] || 0) ? current : least;
    }, upstreamIDs[0]);
    console.log(`Least Connections Selected: ${selected}`);
    return selected;
}

function showLoadBalancerStatus(workerCount: number) {
    console.clear();  
    console.log("🔥 Real-Time Load Balancer Status 🔥");
    const tableData = [];

    for (let i = 0; i < workerCount; i++) {
        tableData.push({
            "Worker ID": i,
            "Requests Handled": workerRequestCount[i],
            "Active Connections": Object.values(activeConnections).reduce((sum, count) => sum + count, 0),
            ...(isHealthCheckEnabled && {
                "Upstream Health Status": JSON.stringify(upstreamHealthStatus),
            }),
        });
    }
    console.table(tableData);
}

async function checkUpstreamHealth(upstreams: { id: string, url: string }[]) {
    for (const upstream of upstreams) {
        let retryCount = 0;
        const healthCheckURL = `${upstream.url}/health`;

        const healthCheck = async () => {
            return new Promise<void>((resolve, reject) => {
                const req = http.request(healthCheckURL, { method: 'GET', timeout: healthCheckTimeout }, (res) => {
                    if (res.statusCode === 200) {
                        upstreamHealthStatus[upstream.id] = true;
                        console.log(`${upstream.id} is healthy.`);
                        resolve();
                    } else {
                        upstreamHealthStatus[upstream.id] = false;
                        console.log(`${upstream.id} is unhealthy. Status Code: ${res.statusCode}`);
                        reject(`Status Code: ${res.statusCode}`);
                    }
                });

                req.on('timeout', () => {
                    upstreamHealthStatus[upstream.id] = false;
                    reject('Timeout Error');
                });

                req.on('error', () => {
                    upstreamHealthStatus[upstream.id] = false;
                    reject('Connection Error');
                });

                req.end();
            });
        };

        try {
            await healthCheck(); // First attempt
        } catch (error) {
            // Retry on failure up to the retry limit
            while (retryCount < healthCheckRetryLimit) {
                retryCount++;
                console.log(`Retrying health check for ${upstream.id} (Attempt ${retryCount})`);
                try {
                    await healthCheck();
                    break; // Exit retry loop if health check succeeds
                } catch {
                    if (retryCount === healthCheckRetryLimit) {
                        console.log(`${upstream.id} failed health checks after ${retryCount} attempts.`);
                        break;
                    }
                }
            }
        }
    }
}
