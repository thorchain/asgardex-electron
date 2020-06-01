export type BinanceTransactionType = {
  _id?: string;
  blockHeight?: number;
  code?: number;
  confirmBlocks?: number;
  data?: any;
  fromAddr: string;
  memo?: string;
  orderId?: string;
  proposalId?: string;
  sequence?: number;
  source?: number;
  timeStamp?: Date;
  toAddr: string;
  txAge?: number;
  txAsset: string;
  txFee: string;
  txHash: string;
  txType: string;
  value: string;
}
