import { BaseService } from '../../services/baseService'
import { tableName } from '../tables/BinanceBalancesTable'

export class BinanceBalancesService extends BaseService {
  constructor() {
    super(tableName)
  }
}
