import { BaseService } from './baseService';

export class TokenService extends BaseService {
  constructor() {
      super();
      console.log('constructing assets service...')
      this.tableName = "Tokens";
  }

  async findAll() {
    console.log('attempting to find all tokens')
      return await this.connection.select({
          from: this.tableName,
      })
  }

  async insert(vals) {
      return await this.connection.insert({
          into: this.tableName,
          values: vals,
          return: true // since studentid is autoincrement field and we need id, 
          // so we are making return true which will return the whole data inserted.
      })
  }

  async findOne(opts) {
    const res = await this.connection.select({
        from: this.tableName,
        where: {
          opts
        }
    }) 
    return res && res[0]
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

  async updateOne(id, updateData) {
      return await this.connection.update({ in: this.tableName,
          set: updateData,
          where: {
              _id: id
          }
      })
  }

}

