import Web3 from 'web3'
import debug from 'debug'

import Core from './lib/hopr'
import Database from './lib/db'
import Server from './lib/server'


const { Client } = require("discord.js");
const { token } = require("./config");

const log = debug('hopr-bot:main')
const error = debug('hopr-bot:main:error')
const { fromWei } = Web3.utils


const main = async () => {
  log(`- main | Starting Bot Main`)

  const node = new Core({
      host: process.env.HOPR_HOST,
      provider: process.env.HOPR_PROVIDER,
      network: process.env.HOPR_NETWORK,
      debug: Boolean(process.env.HOPR_DEBUG),
      password: process.env.HOPR_PASSWORD
  })

  const client = new Client();
  const server = new Server();
  await node.start()

  const hoprAddress = await node.address('hopr')
  const nativeAddress = await node.address('native')
  const hoprBalance = await node.getHoprBalance();
  const nativeBalance = await node.getBalance()
  console.log('HOPR', hoprAddress, fromWei(hoprBalance));
  console.log('Native', nativeAddress, fromWei(nativeBalance));

  require("./core/loadWidgetListeners")(client);
  
  Database.init(client, node);

  client.login(token).catch((error) => {
    error(error);
    process.exit(1);
  });
}

main().catch((err) => {
  error('Fatal Error:', err)
  process.exit()
})