import { RPCBot } from './RPC-bot';
import { RPCBotConfig } from './interfaces';

const config: RPCBotConfig = require('./config.json');
new RPCBot(config);
