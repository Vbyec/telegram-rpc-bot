
#Info
Remote run sh scripts. One script per chat(no script - nothing to run)

# Run in you js/ts code
`yarn add telegram-rpc-bot`

```js
const { RPCBot } = require('telegram-rpc-bot')
const rpcBot = new RPCBot({ token: '{{your_bot_token}}' });
```

#Standalone run
1. Copy `standalone-bot.js` and `config.json` .
2. Paste your bot-token in `config.json`
3. Run: `node standalone-bot.js`

Create new bot in @BotFather and paste your token.
Don`t forget to disable privacy mode in @BotFather (to allow bot read messages, not only slash command)

# Use
1. Add bot to the chat you want to use. 
2. Type /getChatId and bot reply you id of this chat. 
3. Create executable script `chat_{{CHAT_ID}}.sh` with content: 
   ``` shell script 
   echo 'Hello' $1 
   ``` 
4. Test: type in the chat `@your_bot_name {{some_string}}`, bot reply you `Hello {{somestring}}`. 
5. Change content of script what you need.
6. Profit!
