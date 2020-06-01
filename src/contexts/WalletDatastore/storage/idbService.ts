import * as JsStore from 'jsstore'
import { AccountTable } from './tables'
import BinanceBalancesTable from './binance/tables/BinanceBalancesTable'
import BinanceTokensTable from './binance/tables/BinanceTokensTable'
import BinanceTransactionsTable from './binance/tables/BinanceTransactionsTable'
import UserSettingsTable from './tables/UserSettingsTable'
// import WalletAccountsTable from './tables/WalletAccountsTable'

const getWorkerPath = () => {
  return '/scripts/jsstore.worker.min.js'
}

const workerPath = getWorkerPath()
export const idbCon = new JsStore.Connection(new Worker(workerPath))

export const dbname = 'asgard_datastore'

const getDatabase = () => {
  const dataBase = {
    name: dbname,
    tables: [BinanceTransactionsTable, BinanceBalancesTable, BinanceTokensTable, AccountTable, UserSettingsTable]
  }
  return dataBase
}

export const initJsStore = async () => {
  try {
    const dataBase = getDatabase()
    await idbCon.initDb(dataBase)
  } catch (e) {
    console.error(e)
  }
}
