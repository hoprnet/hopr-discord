import Core from './lib/hopr'
import debug from 'debug'

const { Client } = require("discord.js");
const { token } = require("./config");

const log = debug('hopr-bot:main')
const error = debug('hopr-bot:main:error')

const main = async () => {
  log(`- main | Starting Bot Main`)

  const node = await new Core()
  await node.start()

  const client = new Client();

  require("./core/loadWidgetListeners")(client);

  client.login(token).catch((error) => {
    error(error);
    process.exit(1);
  });
}

main().catch((err) => {
  error('Fatal Error:', err)
  process.exit()
})