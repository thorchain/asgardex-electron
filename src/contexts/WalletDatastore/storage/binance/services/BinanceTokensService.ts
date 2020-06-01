import { BaseService } from '../../services/baseService';
import { tableName } from '../tables/BinanceTokensTable'

export class BinanceTokensService extends BaseService {
  constructor() {
      super(tableName);
  }
}

