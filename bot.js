const { Client, GatewayIntentBits } = require("discord.js");
const { Database } = require("./db");
const path = require("node:path");

const fs = require("fs");

class BotConfig {
  constructor(options) {
    this.token = options.token;
  }

  get(key) {
    return this[key];
  }

  set(key, value) {
    this[key] = value;
  }

  static fromFile(pathToFile) {
    try {
      const absPath = path.join(process.cwd(), pathToFile);
      const json = require(absPath);
      return new BotConfig(json);
    } catch (error) {
      throw new Error(`Failed to load config: ${error}`);
    }
  }
}

class Bot {
  /**
   *
   * @param {BotConfig} config
   * @returns {Bot}
   */
  constructor(config) {
    if (!(config instanceof BotConfig)) {
      throw new Error(`config must be an instance of ${BotConfig.name}`);
    }

    /** @type {BotConfig} */
    this.config_ = config;

    /** @type {String[]} */
    this.intents_ = [];

    /** @type {Map<String, Command>} */
    this.commands_ = new Map();

    /** @type {Client} */
    this.client_ = null;

    /** @type {Database} */
    this.db_ = null;

    return this;
  }

  async sendMessage({ guildId, channelId, message }) {
    if (!this.client_.guilds.cache.has(guildId)) return;

    const guild = this.client_.guilds.cache.get(guildId);
    if (!guild.channels.cache.has(channelId)) return;

    const channel = guild.channels.cache.get(channelId);
    return channel.send(message);
  }

  async getUser(id) {
    return this.client_.users.cache.get(id);
  }

  async sendDM({ userId, message }) {
    const user = await this.getUser(userId);
    if (!user) return;

    return user.send(message);
  }

  setDb(db) {
    if (!(db instanceof Database)) {
      throw new Error(`db must be an instance of ${Database.name}`);
    }

    this.db_ = db;
    return this;
  }

  Db() {
    if (!this.db_) {
      throw new Error("Trying to access db before initialization");
    }

    return this.db_;
  }

  addIntent(...intents) {
    this.intents_.push(...intents);
    return this;
  }

  getCommands() {
    return this.commands_;
  }

  getCommand(name) {
    return this.commands_.get(name);
  }

  readCommands() {
    try {
      const commands = new Map();
      const commandFiles = fs
        .readdirSync("./commands")
        .filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        const { command } = require(`./commands/${file}`);
        const commandName = command.name
          ? command.name
          : file.replace(".js", "");

        commands.set(commandName, command);
      }

      return commands;
    } catch (error) {
      throw new Error(`Failed to load commands: ${error}`);
    }
  }

  attachEvents() {
    try {
      const eventFiles = fs
        .readdirSync("./events")
        .filter((file) => file.endsWith(".js"));

      for (const fileName of eventFiles) {
        const eventName = fileName.replace(".js", "");
        if (eventName == "index") continue;

        const event = require(`./events/${fileName}`);
        const handler = this.createEventHandler(event.handler);

        switch (event.method) {
          case "once":
            this.client_.once(eventName, handler);
            break;
          case "on":
            this.client_.on(eventName, handler);
            break;
          default:
            throw new Error(`Unknown event method: ${event.method}`);
        }
      }
    } catch (error) {
      throw new Error(`Failed to attach events: ${error}`);
    }
  }

  createEventHandler(handler) {
    return async (...args) => {
      await handler({
        bot: this,
        payload: args,
      });
    };
  }

  prepare() {
    console.log("Loading commands...");
    this.commands_ = this.readCommands();

    this.client_ = new Client({
      intents: [...this.intents_],
    });

    console.log("Attaching events...");
    this.attachEvents();
    return this;
  }

  login() {
    this.client_.login(this.config_.get("token"));
    return this;
  }
}

module.exports = { Bot, BotConfig };
