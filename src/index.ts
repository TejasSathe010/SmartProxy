import { program } from 'commander';
import cluster from 'node:cluster';
import os from 'node:os';
import { parseYAMLConfig, validateConfig } from './config';

interface CreateServerConfig {
    port: number,
    workerCount: number;
}

async function createServer(config: CreateServerConfig) {
    const { workerCount } = config;
 
    if (cluster.isPrimary) {
        console.log('Master Process is Up!');

        for (let i = 0; i < workerCount; i++) {
            cluster.fork();
            console.log(`Master Process: Worker Node Spinned Up ${i}`);
        }
    } else {
        console.log('Worker Node: Up')
    }
}

async function main() {
    program.option('--config <path>');
    program.parse();

    const options = program.opts();
    if (options && 'config' in options) {
        const validatedConfig = await validateConfig(await parseYAMLConfig(options.config));
        await createServer({ port: validatedConfig.server.listen, workerCount: validatedConfig.server.workers ?? os.cpus().length})
    }
}

main();