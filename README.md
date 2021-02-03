# Install
Copy  `index.js` and `RPC-bot.js`. 

Create `config.json` with same content:

```
{
  "token": "{{PLACE_YOUR_TELEGRAM_BOT_TOKEN}}"
}
```
Create new bot in @BotFather and paste your token
Don`t forget to disable privacy mode in @BotFather (to allow bot read messages, not only slash command)
# Run
```node index.js```

# Use
Add bot to chat you want to use. Type /getChatId and bot reply you id of this chat. 
create executable script `chat_{{CHAT_ID}}.sh` with content:
```
echo 'Hello' $1 
``` 
When you type in chat `@your_bot_name {{some_string}}`, bot reply you `Hello {{somestring}}`. 
Change content of script what you need.
