import Database from '../../../lib/db'

const utils = require("@hoprnet/hopr-utils");
const CommandBuilder = require("../classes/CommandBuilder");

const HOPR_GUILD_ID =   679586195529007116;
const BOT_USER_ID =     788116926244061224;

const usage = `Usage: .register <your_node_address> [secret]`

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
  .setName("register")
  .setAliases(["r"])
  .setOwnersOnly(false)
  .setGuildOnly(true)
  .setRequireArgs(false)
  .setDeletable(false)
  .setCooldown(5)
  .setDisabled(false)
  // eslint-disable-next-line
  .setExecute(async (message, user, args) => {
    const [maybePeerId, pin] = args;
    
    if (!(message.guild || message.server)) {
      await message.author.send(`🤖 Please join our HOPR server to verify your node.`);
      return;
    }

    if (!maybePeerId) {
      await message.channel.send(`
        🤖 Allows you to register your HOPR node in our Discord server.
        ${usage}
        `);
      return;
    } else {
      const peerId = utils.getB58String(maybePeerId);

      if (!peerId) {
        await message.author.send(`🤖 ${maybePeerId} is not a valid HOPR node address`);
        return;
      } else {

        const node = Database.getNode()

        if (!pin) {
          const secret = Math.floor(Math.random() * 1e6);
          Database.store(user.username, { id: user.id, peerId, secret });
          await message.author.send(`🤖 Hi! I'll send ${peerId} a secret. Please send it back to me.`);  
          confirmRegistration(node, peerId, user.username, secret)
        } else {
          await message.author.send(`🤖 Verifying secret ${pin} for ${peerId}.`);
          const savedUser = Database.get(user.username)
          if (!savedUser) {
            await message.channel.send(`
            🤖 Please verify your node first before passing a secret.
            ${usage}
            `);
            return;
          } else {
            const { secret, peerId, id } = savedUser
            // @TODO Migrate from '==' to '===' and cast pin as a number (currently a string)
            if (pin == secret) {
              await message.author.send(`🤖 The secret ${pin} is correct. Registering your node, thank you!`);
              if (message.guild.me.hasPermission("MANAGE_NICKNAMES")) {
                await message.member.setNickname(peerId)
                await message.channel.send(`🤖 User ${user.username} has been blessed with a new name: ${peerId}`);
              } else {
                await message.channel.send(`🤖 Someone tell the admin to give me MANAGE_NICKNAMES permission...`);
              }
            } else {
              await message.author.send(`🤖 The secret ${pin} is incorrect. Please pass the correct one.`);
              confirmRegistration(node, peerId, user.username, secret)
            }
          }
        }
      }

    }

  });
