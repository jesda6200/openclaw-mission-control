export type PriceRow = {
  id: number;
  symbol: string;
  price: number;
  timestamp: string;
};

export interface DBProvider {
  init(): Promise<void>;
  getLatest(symbol: string): Promise<PriceRow | null>;
  getHistory(symbol: string, limit?: number): Promise<PriceRow[]>;
  insertPrice(row: {symbol:string;price:number;timestamp?:string}): Promise<void>;
}
