process.env.NTBA_FIX_319 = '1';

import { execFile } from 'child_process';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { RPCBotConfig } from './interfaces';

const fs = require('fs');

export class RPCBot {
  public bot: TelegramBot = new TelegramBot(this.config.token, { polling: true });
  private commandFolderPath = 'commands/';

  public constructor (
    private config: RPCBotConfig,
  ) {
    this.bot.getMe()
      .then(botUser => {
        this.initCommandFolder();

        this.initGetIdCommandListener();
        this.initBotMentionListener(botUser);
      })
      .catch(error => console.error('Не удалось получить информацию о боте', error));
  }

  /**
   * Проверяет наличие папки для файлов команд и создает если нету
   * @private
   */
  private initCommandFolder () {
    console.group('Проверка папки команд: %s', this.commandFolderPath);
    if (!fs.existsSync(this.commandFolderPath)) {
      console.log('Папки нету, создаю');
      fs.mkdirSync(this.commandFolderPath);
      console.log('Папка создана успешно (наверное)');
    } else {
      console.log('Папка обнаружена');
    }
    console.groupEnd();
  }

  private initBotMentionListener (botUser: TelegramBot.User): void {
    this.bot.onText(new RegExp(`^@${botUser.username} (.+)`), (message, match) => {
      console.group('Получено сообщение, обрабатываю.', JSON.stringify(message));
      const chatId = message.chat.id;
      const query = Array.isArray(match) ? match[1] : '';
      console.log('chat_id: %s, query: %s', chatId, query);
      // Если файла команды еще нету, попробовать создать его. Возможно бота добавили в группу пока скрипт был не активен
      if (fs.existsSync(this.getCommandPath(message))) {
        execFile(this.getCommandPath(message), [query], (error, stdout, stderr) => {
          if (error !== null) {
            console.error('error', error);
            console.error('stderr', stderr);
            this.bot.sendMessage(chatId, 'Ошибка выполнения команды, подробности в логе', { reply_to_message_id: message.message_id })
                .catch(error => console.error('sendMessage', error));
          } else if (stdout) {
            console.log('Посылаю ответ');
            this.bot.sendMessage(chatId, stdout, { reply_to_message_id: message.message_id })
                .catch(error => {
                  if (error.code == 'ETELEGRAM' && error.response?.body?.description?.indexOf('message is too long')) {
                    return this.bot.sendDocument(chatId, Buffer.from(stdout, 'utf8'), {
                      reply_to_message_id: message.message_id
                    }, {
                      filename: '' + message.message_id + '.txt',
                      contentType: 'text/plain'
                    });
                  }
                  else throw error;
                  // @todo отправлять сообщение "что-то пошло не так" в чат
                })
                .catch(error => console.error('sendMessage', error));
          } else {
            console.log('Ошибок при выполнении скрипта не было, ответа тоже, возможно скрипт пустой.');
          }
          console.groupEnd();
        });
      } else {
        console.log('Не найден скрипт для выполнения: %s', this.getCommandPath(message));
        console.groupEnd();
      }
    });
  }

  private initGetIdCommandListener (): void {
    this.bot.onText(new RegExp(`^/getChatId`), (message) => {
      console.log('Получена команда на определение id чата.', JSON.stringify(message));
      const chatId = message.chat.id;
      this.bot.sendMessage(chatId, chatId.toString(), { reply_to_message_id: message.message_id })
          .catch(error => console.error('sendMessage', error));
    });
  }

  private getCommandPath (message: Message): string {
    return this.commandFolderPath + `chat_${message.chat.id}.sh`;
  }
}




