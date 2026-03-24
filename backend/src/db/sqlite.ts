import {DBProvider, PriceRow} from './types';
import sqlite3 from 'sqlite3';
import {open, Database} from 'sqlite';

export class SQLiteProvider implements DBProvider {
  db!: Database<sqlite3.Database, sqlite3.Statement>;
  filename: string;
  constructor(filename = './data/fallback.sqlite') { this.filename = filename }
  async init() {
    this.db = await open({filename: this.filename, driver: sqlite3.Database});
    await this.db.exec(`CREATE TABLE IF NOT EXISTS prices (id INTEGER PRIMARY KEY AUTOINCREMENT, symbol TEXT, price REAL, timestamp TEXT)`);
  }
  async getLatest(symbol: string) {
    const row = await this.db.get('SELECT * FROM prices WHERE symbol = ? ORDER BY id DESC LIMIT 1', symbol);
    return row ? (row as PriceRow) : null;
  }
  async getHistory(symbol: string, limit = 100) {
    const rows = await this.db.all('SELECT * FROM prices WHERE symbol = ? ORDER BY id DESC LIMIT ?', symbol, limit);
    return rows as PriceRow[];
  }
  async insertPrice({symbol, price, timestamp}: {symbol:string;price:number;timestamp?:string}){
    const ts = timestamp || new Date().toISOString();
    await this.db.run('INSERT INTO prices (symbol, price, timestamp) VALUES (?, ?, ?)', symbol, price, ts);
  }
}
