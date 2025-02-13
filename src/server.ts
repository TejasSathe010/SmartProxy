import cluster, { Worker } from 'node:cluster';
import http from 'node:http';
import { ConfigSchemaType, rootConfigSchema } from './config-schema';
import { workerMessageReplySchema, WorkerMessageReplyType, workerMessageSchema, WorkerMessageType } from './server-schema';

interface CreateServerConfig {
    port: number,
    workerCount: number,
    config: ConfigSchemaType,
}

export async function createServer(serverConfig: CreateServerConfig) {
    const { workerCount, port } = serverConfig;
    const WORKER_POOL: Worker[] = [];
 
    if (cluster.isPrimary) {
        console.log('Master Process is Up!');

        for (let i = 0; i < workerCount; i++) {
            const w = cluster.fork({ config: JSON.stringify(serverConfig.config) });
            WORKER_POOL.push(w);
            console.log(`Master Process: Worker Node Spinned Up ${i}`);
        }

        const server = http.createServer((req, res) => {
            const index = Math.floor(Math.random() * WORKER_POOL.length);
            const worker = WORKER_POOL.at(index);

            if (!worker) throw new Error('Worker not found');

            // req.on('data')
            const payload: WorkerMessageType = {
                requestType: 'HTTP', 
                headers: req.headers,
                body: null,
                url: `${req.url}`
            }
            worker.send(JSON.stringify(payload));
            worker.on('message', async (workerReply: string) => {
                const reply = await workerMessageReplySchema.parseAsync(JSON.parse(workerReply));
                console.log(reply);
                if (reply.errorCode) {
                    res.writeHead(parseInt(reply.errorCode));
                    res.end(reply.error);
                    return;
                } else {
                    res.writeHead(200);
                    res.end(reply.data);
                    return;
                }
            });
        });
        server.listen(port, () => {console.log('Reverse Proxy Running on', port)})
    } else {
        console.log('Worker Node: Up');
        const config = await rootConfigSchema.parseAsync(JSON.parse(`${process.env.config}`));
        process.on('message', async (message: string) => {
            console.log('Worker node', message);
            const messageValidated = await workerMessageSchema.parseAsync(JSON.parse(message));
            const requestURL = messageValidated.url;
            const rule = config.server.rules.find((e) => {
                const regex = new RegExp(`^${e.path}.*$`);
                return regex.test(requestURL);
            });
            if (!rule) {
                const reply: WorkerMessageReplyType = {
                    errorCode: '404',
                    error: 'Rule not found'
                };
                if (process.send) return process.send(JSON.stringify(reply));
            }

            const upstreamID = rule?.upstreams[0];
            const upstream = config.server.upstreams.find(e => e.id === upstreamID);
            if (!upstreamID) {
                const reply: WorkerMessageReplyType = {
                    errorCode: '500',
                    error: 'Upstream not found'
                };
                if (process.send) return process.send(JSON.stringify(reply));
            }
            const request = http.request({ host: upstream?.url, path: requestURL, method: 'GET' }, (proxyRes) => {
                let body = '';
                proxyRes.on('data', (chunk) => { body += chunk });
                proxyRes.on('end', () => { 
                    const reply: WorkerMessageReplyType = {
                        data: body
                    }
                    if (process.send) return process.send(JSON.stringify(reply));
                 });
            });
            request.end();
        });
    }
}