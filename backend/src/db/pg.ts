import {DBProvider, PriceRow} from './types';
import {Pool} from 'pg';

export class PostgresProvider implements DBProvider {
  pool: Pool;
  constructor(connectionString?: string){
    this.pool = new Pool({connectionString: connectionString || process.env.DATABASE_URL});
  }
  async init(){
    await this.pool.query(`CREATE TABLE IF NOT EXISTS prices (id SERIAL PRIMARY KEY, symbol TEXT, price DOUBLE PRECISION, timestamp TIMESTAMPTZ)`);
  }
  async getLatest(symbol:string){
    const r = await this.pool.query('SELECT * FROM prices WHERE symbol=$1 ORDER BY id DESC LIMIT 1',[symbol]);
    return r.rows[0] || null;
  }
  async getHistory(symbol:string, limit=100){
    const r = await this.pool.query('SELECT * FROM prices WHERE symbol=$1 ORDER BY id DESC LIMIT $2',[symbol, limit]);
    return r.rows as PriceRow[];
  }
  async insertPrice({symbol, price, timestamp}:{symbol:string;price:number;timestamp?:string}){
    const ts = timestamp || new Date().toISOString();
    await this.pool.query('INSERT INTO prices (symbol, price, timestamp) VALUES ($1,$2,$3)',[symbol,price,ts]);
  }
}
