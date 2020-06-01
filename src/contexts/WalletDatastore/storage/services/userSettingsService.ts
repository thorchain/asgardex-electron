import { BaseService } from './baseService'
import { tableName } from '../../storage/tables/UserSettingsTable'

export class UserSettingsService extends BaseService {
  constructor() {
    super(tableName)
  }
}
