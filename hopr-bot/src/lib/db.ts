import debug from 'debug'

const log = debug('hopr-bot:db')
const error = debug('hopr-bot:db:error')

class Database {
  static db: Map<string, string>
  static init() {
    log(`- init | Starting Init`)
    this.db = new Map<string, string>()
  }
  static store(key, value): void {
    this.db[key] = value
  }
  static get(key): string {
    return this.db[key]
  }
  static dbLength(): number {
    return Object.entries(this.db).length
  }
}

export default Database;