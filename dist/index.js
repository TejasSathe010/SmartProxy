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
const commander_1 = require("commander");
const node_cluster_1 = __importDefault(require("node:cluster"));
const node_os_1 = __importDefault(require("node:os"));
const config_1 = require("./config");
function createServer(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const { workerCount } = config;
        if (node_cluster_1.default.isPrimary) {
            console.log('Master Process is Up!');
            for (let i = 0; i < workerCount; i++) {
                node_cluster_1.default.fork();
                console.log(`Master Process: Worker Node Spinned Up ${i}`);
            }
        }
        else {
            console.log('Worker Node: Up');
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        commander_1.program.option('--config <path>');
        commander_1.program.parse();
        const options = commander_1.program.opts();
        if (options && 'config' in options) {
            const validatedConfig = yield (0, config_1.validateConfig)(yield (0, config_1.parseYAMLConfig)(options.config));
            yield createServer({ port: validatedConfig.server.listen, workerCount: (_a = validatedConfig.server.workers) !== null && _a !== void 0 ? _a : node_os_1.default.cpus().length });
        }
    });
}
main();
