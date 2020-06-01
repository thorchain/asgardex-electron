import { DATA_TYPE } from 'jsstore'
export const tableName = 'Binance_Transactions'
const BinanceTransactionsTable = {
  name: tableName,
  columns: {
    _id: {
      primaryKey: true,
      autoIncrement: true
    },
    txHash: { dataType: DATA_TYPE.String }, // "4B8C65F00CDFFF0EEE11E670D0522F2A356CC4E4CC8760C60D29B1A2CBB03EED",
    blockHeight: { dataType: DATA_TYPE.Number }, // 66083157
    code: { dataType: DATA_TYPE.Number }, // 0
    confirmBlocks: { dataType: DATA_TYPE.Number }, // 0
    data: { dataType: DATA_TYPE.String }, // null
    fromAddr: { dataType: DATA_TYPE.String }, // "tbnb1u4s75mmna5mwqzkj63vye5ykq4numzrnww4rnu"
    memo: { dataType: DATA_TYPE.String }, // ""
    orderId: { dataType: DATA_TYPE.String }, // null
    proposalId: { dataType: DATA_TYPE.String }, // null
    sequence: { dataType: DATA_TYPE.Number }, // 53
    source: { dataType: DATA_TYPE.Number }, // 0
    timeStamp: { dataType: DATA_TYPE.String }, // "2020-02-13T23:58:21.941Z"
    toAddr: { dataType: DATA_TYPE.String }, // "tbnb1ewk0yypfhuw358qw35rw059jkfym96rt7hrykm"
    txAge: { dataType: DATA_TYPE.Number }, // 6961065
    txAsset: { dataType: DATA_TYPE.String }, // "TCAN-014"
    txFee: { dataType: DATA_TYPE.String }, // "0.00037500"
    txType: { dataType: DATA_TYPE.String }, // "TRANSFER"
    value: { dataType: DATA_TYPE.String } // "23.00000000"
  }
}
export default BinanceTransactionsTable
