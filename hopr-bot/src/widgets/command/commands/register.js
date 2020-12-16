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
        Usage: .register <your_node_address> [pin]
        `);
      return
    } else {
      const peerId = utils.getB58String(maybePeerId);
      
      if (!peerId) {
        await message.channel.send(`🤖 ${maybePeerId} is not a valid HOPR node address`);
      } else {
        Database.store(user.username, { id: user.id, peerId });
        await message.channel.send(`🤖 Hi! Will proceed to send ${peerId} a message.`);
      }

    }

  });
