import { BaseService } from "./baseService";

export class TransactionService extends BaseService {

  constructor() {
      super();
      this.tableName = "Transactions";
  }

  async findAll() {
      console.log('trying to get transactions')
      return await this.connection.select({
          from: this.tableName,
      })
  }
  async findLastTx() {
      return await this.connection.select({
          from: this.tableName,
          where: {
              pending: !true
          },
          order: {
            by: timeStamp,
            type: 'desc'
          },
          limit: 1
      })
  }
  async find(opts) {
      return await this.connection.select({
          from: this.tableName,
          where: opts,
      })
  }

  async insert(txs) {
      return await this.connection.insert({
          into: this.tableName,
          values: txs,
          return: true // since studentid is autoincrement field and we need id, 
          // so we are making return true which will return the whole data inserted.
      })
  }
  async upsert(vals) {
      return await this.connection.insert({
          into: this.tableName,
          values: vals,
          upsert: true,
          return: true // since studentid is autoincrement field and we need id, 
          // so we are making return true which will return the whole data inserted.
      })
  }

  async findOne(id) {
      return await this.connection.select({
          from: this.tableName,
          where: {
              id: id
          }
      })
  }
  async remove (opts) {
    return await this.connection.remove({
        from: this.tableName,
        where: opts
    })
  }

  removeOne(id) {
      return this.connection.remove({
          from: this.tableName,
          where: {
              id: id
          }
      })
  }
  removeAll() {
    return this.connection.clear(this.tableName)
  }

  updateOne(id, updateData) {
      return this.connection.update({ in: this.tableName,
          set: updateData,
          where: {
              id: id
          }
      })
  }
}