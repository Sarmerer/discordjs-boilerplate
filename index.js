const { GatewayIntentBits } = require("discord.js");
const { Bot, BotConfig } = require("./bot");

const config = BotConfig.fromFile("./config.json");
const bot = new Bot(config);
bot.addIntent(GatewayIntentBits.Guilds);

bot.prepare().login();
