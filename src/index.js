const { GatewayIntentBits } = require("discord.js");
const { Bot, BotConfig } = require("./types/bot");

const config = BotConfig.fromFile("./config.json");
const bot = new Bot(config);
bot.addIntent(GatewayIntentBits.Gu);

bot.prepare().login();
