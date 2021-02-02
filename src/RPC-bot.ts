process.env.NTBA_FIX_319 = '1';

import { execFile } from 'child_process';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { RPCBotConfig } from './interfaces';

const fs = require('fs');
const os = require('os');

export class RPCBot {
  private bot: TelegramBot = new TelegramBot(this.config.token, { polling: true });
  private commandFolderPath = 'commands/';

  public constructor (
    private config: RPCBotConfig,
  ) {
    this.bot.getMe()
      .then(botUser => {
        this.initCommandFolder();

        this.initAddNewGroupListener(botUser);
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

  /**
   * Слушатель добавления бота в новый чат.
   * @private
   */
  private initAddNewGroupListener (botUser: TelegramBot.User): void {
    this.bot.on('new_chat_members', (msg) => {
      if (msg.new_chat_members?.find(user => user.id === botUser.id)) {
        this.onBotAddedToNewGroup(msg);
      }
    });
  }

  private initBotMentionListener (botUser: TelegramBot.User): void {
    this.bot.onText(new RegExp(`^@${botUser.username} (.+)`), (message, match) => {
      console.group('Получено сообщение, обрабатываю.', JSON.stringify(message));
      const chatId = message.chat.id;
      const query = Array.isArray(match) ? match[1] : '';
      console.log('chat_id: %s, query: %s', chatId, query);
      // Если файла команды еще нету, попробовать создать его. Возможно бота добавили в группу пока скрипт был не активен
      if (!fs.existsSync(this.getCommandPath(message))) {
        this.onBotAddedToNewGroup(message);
      }

      execFile(this.getCommandPath(message), [query], (error, stdout, stderr) => {
        if (error !== null) {
          console.error('error', error);
          console.error('stderr', stderr);
          this.bot.sendMessage(chatId, 'Ошибка выполнения команды, подробности в логе', { reply_to_message_id: message.message_id });
        } else if (stdout) {
          // @todo.Alisov Предусмотреть вариант, когда ответ слишком большой и отсылать файл тогда
          console.log('Посылаю ответ');
          this.bot.sendMessage(chatId, stdout, { reply_to_message_id: message.message_id });
        } else {
          console.log('Ошибок при выполнении скрипта не было, ответа тоже, возможно скрипт пустой.');
        }
        console.groupEnd();
      });
    });


  }

  /**
   * Хук, что нужно выполнить когда бота добавили в группу:
   * Добавить новый файл chat_%id%.sh, внутри файла первой строкой комментарием написать кто добавил, когда добавил и как называется чат.
   * @param message
   * @private
   */
  private onBotAddedToNewGroup (message: Message): void {
    console.group('Хук на добавления бота в новую группу');
    const file_path = this.getCommandPath(message);
    console.log('Проверяю наличие файла команды: %s', file_path);

    if (!fs.existsSync(file_path)) {
      console.log('Файла нет, создаю новый');
      const create_date = new Date(message.date * 1000).toLocaleString('ru-Ru');
      let whom = message.from?.first_name;
      if (message.from?.last_name) {
        whom += ' ' + message.from?.last_name;
      }
      if (message.from?.username) {
        whom += ` (@${message.from.username})`;
      }

      const group_name = message.chat.title;
      fs.appendFileSync(file_path, `# ${create_date}| ${whom}| ${group_name}` + os.EOL, { encoding: 'utf8', mode: 0o766 });
      console.log('Файл успешно создан (наверное)');
    } else {
      console.log('Файл найден, ничего не делаю');
    }

    console.groupEnd();
  }

  private getCommandPath (message: Message): string {
    return this.commandFolderPath + `chat_${message.chat.id}.sh`;
  }

}




