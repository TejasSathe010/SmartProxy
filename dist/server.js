"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
const node_cluster_1 = __importDefault(require("node:cluster"));
const node_http_1 = __importDefault(require("node:http"));
const config_schema_1 = require("./config-schema");
const server_schema_1 = require("./server-schema");
const activeConnections = {};
const workerRequestCount = {};
function createServer(serverConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const { workerCount, port } = serverConfig;
        const WORKER_POOL = [];
        if (node_cluster_1.default.isPrimary) {
            console.log('Master Process is Up!');
            for (let i = 0; i < workerCount; i++) {
                const w = node_cluster_1.default.fork({ config: JSON.stringify(serverConfig.config) });
                WORKER_POOL.push(w);
                workerRequestCount[i] = 0;
                console.log(`Master Process: Worker Node Spinned Up ${i}`);
            }
            const server = node_http_1.default.createServer((req, res) => {
                const index = Math.floor(Math.random() * WORKER_POOL.length);
                const worker = WORKER_POOL.at(index);
                if (!worker)
                    throw new Error('Worker not found');
                workerRequestCount[index]++;
                const payload = {
                    requestType: 'HTTP',
                    headers: req.headers,
                    body: null,
                    url: `${req.url}`
                };
                worker.send(JSON.stringify(payload));
                worker.once('message', (workerReply) => __awaiter(this, void 0, void 0, function* () {
                    const reply = yield server_schema_1.workerMessageReplySchema.parseAsync(JSON.parse(workerReply));
                    if (res.headersSent)
                        return;
                    if (reply.errorCode) {
                        res.writeHead(parseInt(reply.errorCode));
                        res.end(reply.error);
                    }
                    else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(reply.data);
                    }
                }));
                showLoadBalancerStatus(WORKER_POOL.length);
            });
            server.listen(port, () => { console.log('Reverse Proxy Running on', port); });
        }
        else {
            console.log('Worker Node: Up');
            const config = yield config_schema_1.rootConfigSchema.parseAsync(JSON.parse(`${process.env.config}`));
            process.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const messageValidated = yield server_schema_1.workerMessageSchema.parseAsync(JSON.parse(message));
                const requestURL = messageValidated.url;
                const rule = config.server.rules.find((e) => {
                    const regex = new RegExp(`^${e.path}.*$`);
                    return regex.test(requestURL);
                });
                if (!rule) {
                    const reply = { errorCode: '404', error: 'Rule not found' };
                    if (process.send)
                        return process.send(JSON.stringify(reply));
                }
                const upstreamID = selectUpstream((_a = rule === null || rule === void 0 ? void 0 : rule.upstreams) !== null && _a !== void 0 ? _a : [], config.server.upstreams);
                const upstream = config.server.upstreams.find(e => e.id === upstreamID);
                if (!upstream) {
                    const reply = { errorCode: '500', error: 'Upstream not found' };
                    if (process.send)
                        return process.send(JSON.stringify(reply));
                }
                activeConnections[upstreamID] = (activeConnections[upstreamID] || 0) + 1;
                console.log(`Selected Upstream: ${upstreamID} | Active Connections:`, activeConnections);
                const request = node_http_1.default.request({ host: upstream === null || upstream === void 0 ? void 0 : upstream.url, path: requestURL, method: 'GET' }, (proxyRes) => {
                    let body = '';
                    proxyRes.on('data', (chunk) => { body += chunk; });
                    proxyRes.on('end', () => {
                        const reply = { data: body };
                        if (process.send)
                            return process.send(JSON.stringify(reply));
                        activeConnections[upstreamID] = Math.max((activeConnections[upstreamID] || 1) - 1, 0);
                        console.log(`Updated Active Connections:`, activeConnections);
                    });
                });
                request.end();
            }));
        }
    });
}
function selectUpstream(upstreamIDs, upstreams) {
    var _a, _b, _c;
    const availableUpstreams = upstreamIDs
        .map(id => upstreams.find(up => up.id === id))
        .filter((up) => up !== undefined);
    if (availableUpstreams.length === 0)
        return (_a = upstreamIDs[0]) !== null && _a !== void 0 ? _a : '';
    const strategy = process.env.LOAD_BALANCE_STRATEGY || 'round_robin';
    if (strategy === 'round_robin') {
        return roundRobin(availableUpstreams.map(up => up.id));
    }
    else if (strategy === 'least_connections') {
        return leastConnections(availableUpstreams.map(up => up.id));
    }
    else {
        return (_c = (_b = availableUpstreams[0]) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : '';
    }
}
let rrIndex = 0;
function roundRobin(upstreamIDs) {
    const selected = upstreamIDs[rrIndex % upstreamIDs.length];
    rrIndex++;
    console.log(`Round Robin Selected: ${selected}`);
    return selected;
}
function leastConnections(upstreamIDs) {
    const selected = upstreamIDs.reduce((least, current) => {
        return (activeConnections[current] || 0) < (activeConnections[least] || 0) ? current : least;
    }, upstreamIDs[0]);
    console.log(`Least Connections Selected: ${selected}`);
    return selected;
}
function showLoadBalancerStatus(workerCount) {
    console.clear();
    console.log("🔥 Real-Time Load Balancer Status 🔥");
    const tableData = [];
    for (let i = 0; i < workerCount; i++) {
        tableData.push({
            "Worker ID": i,
            "Requests Handled": workerRequestCount[i],
            "Active Connections": Object.values(activeConnections).reduce((sum, count) => sum + count, 0)
        });
    }
    console.table(tableData);
}
