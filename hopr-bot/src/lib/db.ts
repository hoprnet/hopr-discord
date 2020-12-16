import debug from 'debug'

const log = debug('hopr-bot:db')
const error = debug('hopr-bot:db:error')

type UserData = {
  id: string,
  peerId: string
}

class Database {
  static db: Map<string, UserData>
  static client: any
  static node: any
  static init(client, node) {
    log(`- init | Starting Init`)
    this.db = new Map<string, UserData>()
    this.node = node;
    this.client = client;
  }
  static store(key, value): void {
    this.db[key] = value
  }
  static get(key): UserData {
    return this.db[key]
  }
  static dbLength(): number {
    return Object.entries(this.db).length
  }
  static getClient() {
    return this.client;
  }
}

export default Database;