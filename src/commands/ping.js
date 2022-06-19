const { Command } = require("../types/command");
const { CommandStringOption } = require("../types/command-options");

const ping = new Command({
  name: "ping",
  description: "Pong!",

  options: [
    new CommandStringOption({
      name: "text",
      description: "Custom text to reply with",
      required: false,
    }),
  ],

  execute: async ({ interaction, bot }) => {
    const { options } = interaction;
    const customText = options.getString("text");

    const callee = interaction.user;
    const calleeId = `${callee.username}#${callee.discriminator}`;
    const text = `${customText || "Pong!"} to ${calleeId}`;

    await interaction.reply(text);
  },
});

module.exports = {
  command: ping,
};
