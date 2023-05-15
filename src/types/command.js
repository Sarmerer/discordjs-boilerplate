const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const { CommandOption } = require("./command-options");

/**
 * @typedef {Object} ExecutePayload
 * @property {ChatInputCommandInteraction} interaction
 * @property {Bot} bot
 *
 * @callback Execute
 * @param {ExecutePayload} payload
 */

class Command {
  /**
   * @param {Object} options
   * @param {String} options.name
   * @param {String} options.description
   * @param {CommandOption[]} options.options
   * @param {Command[]} options.subcommands
   * @param {Execute} options.execute
   *
   * @returns {Command}
   */
  constructor(options) {
    /** @type {String} */
    this.name = options.name;

    /** @type {String} */
    this.description = options.description;

    /** @type {Map<String, Command>} */
    this.subcommands = new Map();

    /** @type {CommandOption[]} */
    this.options = new Array();

    if (Array.isArray(options.subcommands)) {
      throw new Error("Subcommands are still under development");

      for (const subcommand of options.subcommands) {
        if (!(subcommand instanceof Command)) {
          console.error(`subcommand must be an instance of ${Command.name}`);
          continue;
        }

        subcommand.isSubcommand_ = true;
        this.addSubcommand(subcommand);
      }
    }

    if (Array.isArray(options.options)) {
      for (const option of options.options) {
        if (!(option instanceof CommandOption)) {
          console.error(`option must be an instance of ${CommandOption.name}`);
          continue;
        }

        this.addOption(option);
      }
    }

    if (typeof options.execute === "function") {
      this.execute = options.execute;
    } else {
      throw new Error("execute must be a function");
    }

    return this;
  }

  /**
   * @param {Command} subcommand
   * @returns {Command}
   */
  addSubcommand(subcommand) {
    if (!(subcommand instanceof Command)) {
      throw new Error(`subcommand must be an instance of ${Command.name}`);
    }

    this.subcommands.set(subcommand.name, subcommand);
    return this;
  }

  /**
   * @param {CommandOption} option
   * @returns {Command}
   */
  addOption(option) {
    if (!(option instanceof CommandOption)) {
      throw new Error(`option must be an instance of ${CommandOption.name}`);
    }

    this.options.push(option);
    return this;
  }

  /**
   * @param {Object} payload
   * @param {Bot} payload.bot
   * @param {Interaction} payload.interaction
   */
  execute(payload) {
    throw new Error("Not implemented");
  }

  /**
   * @returns {SlashCommandBuilder}
   */
  toSlashCommand() {
    const builder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);

    for (const option of this.options) {
      option.toSlashCommand(builder);
    }

    for (const subcommand of this.subcommands.values()) {
      builder.addSubcommand(subcommand.toSlashCommand());
    }

    return builder;
  }
}

module.exports = { Command };
