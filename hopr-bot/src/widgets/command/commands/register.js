import Database from '../../../lib/db'

const utils = require("@hoprnet/hopr-utils");
const CommandBuilder = require("../classes/CommandBuilder");


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
        Usage: .register <your_node_address> [secret]
        `);
      return
    } else {
      const peerId = utils.getB58String(maybePeerId);

      if (!peerId) {
        await message.channel.send(`🤖 ${maybePeerId} is not a valid HOPR node address`);
      } else {
        if (!pin) {
          const secret = Math.floor(Math.random() * 1e6);
          Database.store(user.username, { id: user.id, peerId, secret });
          await message.channel.send(`🤖 Hi! Will proceed to send ${peerId} a message.`);
          const node = Database.getNode()
          node.send({
            peerId,
            payload: ` 🤖 Username ${user.username} is registering your node in Discord. Please share ${secret} to confirm.`,
            intermediatePeerIds: [],
            includeRecipient: true
          })
        } else {
          await message.channel.send(`🤖 ${peerId} verifying the secret ${secret}`);
        }
      }

    }

  });
