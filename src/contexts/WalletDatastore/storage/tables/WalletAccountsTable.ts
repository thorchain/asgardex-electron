import { DATA_TYPE } from 'jsstore'
export const tableName = 'Wallet_Account'
const WalletAccountsTable = {
  name: tableName,
  columns: {
    _id: {
      primaryKey: true,
      autoIncrement: true
    },
    addresses: {
      dataType: DATA_TYPE.Array
    },
    chainName: {
      dataType: DATA_TYPE.String
    },
    networkType: {
      dataType: DATA_TYPE.String
    }
  }
}
export default WalletAccountsTable
