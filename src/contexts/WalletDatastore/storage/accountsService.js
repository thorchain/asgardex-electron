import { BaseService } from './baseService';

export class AccountService extends BaseService {
  constructor() {
      super();
      console.log('constructing assets service...')
      this.tableName = "Accounts";
  }

  async findAll() {
    console.log('attempting to find all user accounts')
      return await this.connection.select({
          from: this.tableName
      })
  }

  async insert(vals) {
    console.log('why is insert failing?')
    console.log(vals)
      return await this.connection.insert({
          into: this.tableName,
          values: vals,
          return: true // since studentid is autoincrement field and we need id, 
          // so we are making return true which will return the whole data inserted.
      })
  }

  async findOne(opts) {
    const query = opts || {}
    query.from = this.tableName
    const res = await this.connection.select(query)
    return res && res[res.length-1]
  }

  async removeOne(id) {
      return await this.connection.remove({
          from: this.tableName,
          where: {
              _id: id
          }
      })
  }
  async removeAll() {
    return await this.connection.clear(this.tableName)
  }

  async update(opts) {
    return await this.connection.update({
      in: this.tableName,
      opts
    })
  }
  async updateOne(id, updateData) {
      return await this.connection.update({ in: this.tableName,
          set: updateData,
          where: {
              _id: id
          }
      })
  }

}
