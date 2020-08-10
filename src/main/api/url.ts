import { shell } from 'electron'

import { ApiUrl } from '../../shared/api/types'

export const apiUrl: ApiUrl = {
  openExternal: (url) => shell.openExternal(url)
}
