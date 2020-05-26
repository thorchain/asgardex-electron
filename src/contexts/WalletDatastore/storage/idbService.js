import * as JsStore from 'jsstore';
import { TransactionTable, AssetTable, TokenTable, AccountTable } from './tables'

const getWorkerPath = () => {
  return '/scripts/jsstore.worker.min.js'
};

const workerPath = getWorkerPath();
export const idbCon = new JsStore.Connection(new Worker(workerPath));

export const dbname = 'asgard_datastore';

const getDatabase = () => {
    const dataBase = {
        name: dbname,
        tables: [TransactionTable, AssetTable, TokenTable, AccountTable]
    };
    return dataBase;
};

export const initJsStore = async () => {
    try {
        const dataBase = getDatabase()
        await idbCon.initDb(dataBase);
    }
    catch (e) {
        console.error(e);
    }
};
