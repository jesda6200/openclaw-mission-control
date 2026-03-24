import {DBProvider} from './types';
import {SQLiteProvider} from './sqlite';
import {PostgresProvider} from './pg';

export async function createProvider(): Promise<DBProvider> {
  const mode = process.env.NODE_ENV === 'fallback' || process.env.DB_FALLBACK === 'sqlite';
  if(mode){
    const p = new SQLiteProvider(process.env.SQLITE_FILE || './data/fallback.sqlite');
    await p.init();
    return p;
  }
  const pg = new PostgresProvider(process.env.DATABASE_URL);
  await pg.init();
  return pg;
}
