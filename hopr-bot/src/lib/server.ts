import debug from 'debug'
import Database from './db'

const http = require('http')
const service = require('restana')()

const log = debug('hopr-bot:server')
const error = debug('hopr-bot:server:error')

service.get('/', (_, res) => res.send({ hello: "world" }))
service.get('/users', (_, res) => res.send({ users: Database.dbLength() }))

const main = () => {
  log(`- main | Starting Server`)
  http.createServer(service).listen(3001, "0.0.0.0", () => {
    log(`- main | createServer :: Rest server on 0.0.0.0 listening on port 3001`)
  })
}

export default main;