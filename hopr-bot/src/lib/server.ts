import debug from 'debug'
import Database from './db'

const http = require('http')
const service = require('restana')()
const bodyParser = require('body-parser')

const log = debug('hopr-bot:server')
const error = debug('hopr-bot:server:error')

service.use(bodyParser.json())

service.get('/', (_, res) => res.send({ hello: "world" }))
service.get('/users', (_, res) => res.send({ users: Database.dbLength() }))
service.post('/reply', async (req, res) => {
  const username = req.body.username || ''
  if (!username) {
    res.send({ status: 'error', error: 'No username was passed' })  
    return
  }
  const userId = Database.get(username)
  if (!userId) {
    res.send({ status: 'error', error: `Username ${username} hasn’t reached us yet.` })  
    return
  }
  try {
    const client = Database.getClient()
    const user = client.users.cache.get(userId);
    user.send('Hello world')
    res.send({ status: 'ok' })
  } catch (e) {
    res.send({ status: 'error', error: e })
  }
})

const main = () => {
  log(`- main | Starting Server`)
  http.createServer(service).listen(3001, "0.0.0.0", () => {
    log(`- main | createServer :: Rest server on 0.0.0.0 listening on port 3001`)
  })
}

export default main;