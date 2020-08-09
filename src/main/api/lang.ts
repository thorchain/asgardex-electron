import { ipcRenderer } from 'electron'

import { ApiLang } from '../../shared/api/types'
import { Locale } from '../../shared/i18n/types'
import IPCMessages from '../ipc/messages'

export const apiLang: ApiLang = {
  update: (locale: Locale) => ipcRenderer.send(IPCMessages.UPDATE_LANG, locale)
}
