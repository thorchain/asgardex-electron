import { DATA_TYPE } from 'jsstore'
export const tableName = 'Binance_Balances'
const BinanceBalancesTable = {
  name: tableName,
  columns: {
    _id: {
      primaryKey: true,
      autoIncrement: true
    },
    // relational key for multiple accounts support
    address: {
      dataType: DATA_TYPE.String
    },
    free: {
      dataType: DATA_TYPE.String
    },
    frozen: {
      dataType: DATA_TYPE.String
    },
    locked: {
      dataType: DATA_TYPE.String
    },
    symbol: {
      dataType: DATA_TYPE.String
    }
  }
}
export default BinanceBalancesTable
