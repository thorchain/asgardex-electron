import { DATA_TYPE } from 'jsstore'
export const tableName = 'Binance_Tokens'
const BinanceTokensTable = {
  name: tableName,
  columns: {
    _id: {
      primaryKey: true,
      autoIncrement: true
    },
    mintable: {
      dataType: DATA_TYPE.Boolean
    },
    name: {
      dataType: DATA_TYPE.String
    },
    original_symbol: {
      dataType: DATA_TYPE.String
    },
    symbol: {
      dataType: DATA_TYPE.String
    },
    owner: {
      dataType: DATA_TYPE.String
    },
    total_supply: {
      dataType: DATA_TYPE.String
    }
  }
}
export default BinanceTokensTable
