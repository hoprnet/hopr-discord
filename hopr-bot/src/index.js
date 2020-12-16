import Core from './lib/hopr'
import Database from './lib/db'
import Server from './lib/server'
import debug from 'debug'

const { Client } = require("discord.js");
const { token } = require("./config");

const log = debug('hopr-bot:main')
const error = debug('hopr-bot:main:error')

const main = async () => {
  log(`- main | Starting Bot Main`)

  const node = new Core({
      host: process.env.HOPR_HOST,
      provider: process.env.HOPR_PROVIDER,
      network: process.env.HOPR_NETWORK,
      debug: Boolean(process.env.HOPR_DEBUG),
      password: process.env.HOPR_PASSWORD
  })
  await node.start()
  const hoprAddress = await node.address('hopr')
  console.log('Hopr Address', hoprAddress)

  const client = new Client();
  const server = new Server();
  Database.init(client);

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