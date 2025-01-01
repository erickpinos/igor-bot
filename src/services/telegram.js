const TelegramBot = require("node-telegram-bot-api");
const { BOT_TOKEN } = require("../config/settings");

const bot = new TelegramBot(BOT_TOKEN, { polling: false });

const sendMessage = (chatId, message) => {
  return bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
};

module.exports = {
  sendMessage
};
