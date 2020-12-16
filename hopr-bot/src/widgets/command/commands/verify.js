import Database from '../../../lib/db'

const utils = require("@hoprnet/hopr-utils");
const CommandBuilder = require("../classes/CommandBuilder");

const short = (value) => {
  const INITIAL_CHARACTERS_TO_SHOW = 6
  return `...${value.substring(value.length - INITIAL_CHARACTERS_TO_SHOW, value.length)}`
}

const usage = `Usage: verify <pin>`

const confirmRegistration = (node, peerId, username, secret) =>
  node.send({
    peerId,
    payload: `

    🤖 User ${username} is trying to register this address in Discord. If this is you,
    please use code ${secret} with our Discord bot to confirm.
  `,
    intermediatePeerIds: [],
    includeRecipient: true
  })

module.exports = new CommandBuilder()
  .setName("verify")
  .setAliases(["v"])
  .setOwnersOnly(false)
  .setGuildOnly(true)
  .setRequireArgs(false)
  .setDeletable(false)
  .setCooldown(5)
  .setDisabled(false)
  // eslint-disable-next-line
  .setExecute(async (message, user, args) => {
    const [pin] = args;

    if (!(message.guild || message.server)) {
      await message.author.send(`🤖 Please start our registration process from our HOPR server`);
      return;
    }

    if (!pin) {
      await message.channel.send(`
        🤖 Allows you to verify your HOPR node in our Discord server.
        ${usage}
        `);
      return;
    } 

    const savedUser = Database.get(user.username)

    if (!savedUser) {
      await message.channel.send(`
        🤖 Please register your node first using the \`register\` command.
        ${usage}
      `);
      return;
    } else {
      await message.channel.send(`🤖 Verifying node for ${user.username}.`);
      const { secret, peerId, id } = savedUser
      // @TODO Migrate from '==' to '===' and cast pin as a number (currently a string)
      if (pin == secret) {
        await message.author.send(`🤖 The secret ${pin} is correct. Registering your node, thank you!`);

        if (message.guild.me.hasPermission("MANAGE_NICKNAMES")) {
          await message.member.setNickname(`${user.username} - ${short(peerId)}`)
          await message.channel.send(`🤖 User ${user.username} has been blessed with a new suffix: ${short(peerId)}`);
        } else {
          await message.channel.send(`🤖 Someone tell the admin to give me MANAGE_NICKNAMES permission...`);
        }

      } else {
        await message.author.send(`🤖 The secret ${pin} is incorrect. Please pass the correct one.`);
        confirmRegistration(node, peerId, user.username, secret)
      }
    }

  });
