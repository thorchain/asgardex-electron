import { BaseService } from '../../services/baseService'
import { tableName } from '../tables/BinanceTransactionsTable'

export class BinanceTransactionsService extends BaseService {
  constructor() {
    super(tableName)
  }
  async findLastTx() {
    return await this.connection.select({
      from: this.tableName,
      where: {
        pending: !true
      },
      order: {
        by: 'timeStamp',
        type: 'desc'
      },
      limit: 1
    })
  }
}
