const { Bot, BotConfig } = require("./types/bot");
const { Intents } = require("discord.js");

const config = BotConfig.fromFile("./config.json");
const bot = new Bot(config);
bot.addIntent(Intents.FLAGS.GUILD_MESSAGES);

bot.prepare().login();
