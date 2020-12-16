import Database from '../../../lib/db'

const utils = require("@hoprnet/hopr-utils");
const CommandBuilder = require("../classes/CommandBuilder");

const short = (value) => {
  const INITIAL_CHARACTERS_TO_SHOW = 6
  return `...${value.substring(value.length - INITIAL_CHARACTERS_TO_SHOW, value.length)}`
}

const usage = `Usage: .register <your_node_address>`

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
  .setGuildOnly(false)
  .setRequireArgs(false)
  .setDeletable(false)
  .setCooldown(5)
  .setDisabled(false)
  // eslint-disable-next-line
  .setExecute(async (message, user, args) => {
    const [maybePeerId] = args;

    if (!maybePeerId) {
      await message.author.send(`
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
        const secret = Math.floor(Math.random() * 1e6);
        Database.store(user.username, { id: user.id, peerId, secret });
        await message.author.send(`🤖 Hi! I'll send ${peerId} a secret. Tag me with \`verify $secret\` in our #🤖-bot-channel to register you.`);  
        confirmRegistration(node, peerId, user.username, secret)
      }
    }

  });
