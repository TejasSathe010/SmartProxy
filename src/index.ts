#!/usr/bin/env node

import { createServer } from './server';
import { validateConfig, parseYAMLConfig } from './config';
import os from 'node:os';
import { program } from 'commander';

export async function startServer(configPath: string) {
  const validatedConfig = await validateConfig(await parseYAMLConfig(configPath));
  await createServer({
    port: validatedConfig.server.listen,
    workerCount: validatedConfig.server.workers ?? os.cpus().length,
    config: validatedConfig
  });
}

program.option('--config <path>', 'Path to YAML config');
program.parse();

const options = program.opts();
if (options.config) {
  startServer(options.config).catch(err => {
    console.error('Failed to start server:', err);
  });
} else {
  console.error('Config path is required.');
  process.exit(1);
}
