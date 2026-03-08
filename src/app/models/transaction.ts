export interface Transaction {
    id?: number;
    assetId: number;
    type: 'buy' | 'sell';
    quantity: number;
    price: number;
    date: string;
    userId?: number;
  }