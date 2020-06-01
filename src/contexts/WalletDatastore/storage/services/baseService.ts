import { idbCon } from '../idbService'
import { SelectQuery, UpdateQuery } from 'jsstore/dist/ts/common'
export class BaseService {
  tableName: string
  constructor(tableName: string) {
    this.tableName = tableName
  }
  get connection() {
    return idbCon
  }
  async findOne<T>(opts?: SelectQuery): Promise<T> {
    opts ? opts.from = this.tableName : opts = { from: this.tableName}
    const res = await this.connection.select<T>(opts)
    return res && res[res.length - 1]
  }
  async find<T>(opts: SelectQuery): Promise<T[]> {
    opts ? opts.from = this.tableName : opts = { from: this.tableName}
    return await this.connection.select(opts)
  }
  async findAll<T>(): Promise<T[]>{
    console.log('we finding all...')
    return await this.connection.select({ from: this.tableName })
  }

  async insert(vals: object[]) {
    return await this.connection.insert({
      into: this.tableName,
      values: vals,
      return: true
    })
  }
  async upsert(vals: object[]) {
    return await this.connection.insert({
      into: this.tableName,
      values: vals,
      upsert: true,
      return: true
    })
  }

  async remove(opts: SelectQuery) {
    opts ? opts.from = this.tableName : opts = { from: this.tableName}
    return await this.connection.remove(opts)
  }

  async removeOne(id: string) {
    return this.connection.remove({ from: this.tableName, where: { id: id } })
  }
  async removeAll() {
    return this.connection.clear(this.tableName)
  }

  async update(opts: UpdateQuery) {
    opts.in = this.tableName
    return await this.connection.update(opts)
  }
  async updateOne(id: string, updateData: object) {
    return this.connection.update({
      in: this.tableName,
      set: updateData,
      where: {
        _id: id
      }
    })
  }
}
