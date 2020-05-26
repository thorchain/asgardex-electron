// import * as JsStore from 'jsstore';
// import { TransacctionTable, TransactionTable } from './tables/index.js'
// // import { TransactionService } from '../storage/transactionsService'

// const workerPath = 'node_modules/jsstore/dist/jsstore.worker.js';
// const dbname = 'wallet_store';

// var dbName ='JsStore_Demo5';
// function getDbSchema() {
//   // var tblProduct = {
//   //   name: 'Product',
//   //   columns: {
//   //       // Here "Id" is name of column
//   //       id:{ primaryKey: true, autoIncrement: true },
//   //       itemName:  { notNull: true, dataType: "string" },
//   //       price:  { notNull: true, dataType: "number" },
//   //       quantity : { notNull: true, dataType: "number" }
//   //   }
//   // };
//   var db = {
//       name: dbName,
//       tables: [TransactionTable]
//   }
//   return db;
// }

// export class WalletStore {
//   constructor () {
//     console.log('constructing the wallet store')
//   }
//   async init() {
//     console.log('initializing the wallet store class...')
//     this.db = new JsStore.Connection(new Worker(workerPath));

//     var database = getDbSchema();
//     const isDbCreated = await this.db.initDb(database);
//     if(isDbCreated===true){
//         console.log("db created in class");
//         // here you can prefill database with some data
//     }
//     else {
//         console.log("db opened in class");
//     }
//   }
// }

