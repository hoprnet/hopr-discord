import Database from '../../../lib/db'

const utils = require("@hoprnet/hopr-utils");
const CommandBuilder = require("../classes/CommandBuilder");

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
  .setOwnersOnly(false)
  .setGuildOnly(false)
  .setRequireArgs(false)
  .setDeletable(false)
  .setCooldown(5)
  .setDisabled(false)
  // eslint-disable-next-line
  .setExecute(async (message, user, args) => {
    const [maybePeerId, pin] = args;

    if (!maybePeerId) {
      await message.channel.send(`
        🤖 .register Allows you to register your HOPR node in our Discord server.
        ${usage}
        `);
      return;
    } else {
      const peerId = utils.getB58String(maybePeerId);

      if (!peerId) {
        await message.channel.send(`🤖 ${maybePeerId} is not a valid HOPR node address`);
        return;
      } else {

        const node = Database.getNode()

        if (!pin) {
          const secret = Math.floor(Math.random() * 1e6);
          Database.store(user.username, { id: user.id, peerId, secret });
          await message.channel.send(`🤖 Hi! Will proceed to send ${peerId} a message.`);  
          confirmRegistration(node, peerId, user.username, secret)
        } else {
          await message.channel.send(`🤖 Verifying the secret ${pin} for ${peerId}.`);
          const savedUser = Database.get(user.username)
          if (!savedUser) {
            await message.channel.send(`
            🤖 Please verify your node first before passing a secret.
            ${usage}
            `);
            return;
          } else {
            const { secret, peerId } = savedUser
            console.log('Pin', pin)
            console.log('Secret', secret)
            if (pin == secret) {
              await message.channel.send(`🤖 The secret ${pin} is correct. Registering your node, thank you!`);
              // @TODO: Update Discord nickname.
            } else {
              await message.channel.send(`🤖 The secret ${pin} is incorrect. Please pass the correct one.`);
              confirmRegistration(node, peerId, user.username, secret)
            }
          }
        }
      }

    }

  });
