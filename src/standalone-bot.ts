import { RPCBotConfig } from './interfaces';
import { RPCBot } from './RPC-bot';

const config: RPCBotConfig = require('./config.json');
new RPCBot(config);
