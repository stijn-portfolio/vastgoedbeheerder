export interface Asset {
    id: number;
    symbol: string;
    name: string;
    assetType: 'stock' | 'etf';
    currentPrice?: number;
  }