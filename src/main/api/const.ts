import path from 'path'

import { app } from 'electron'

export const APP_NAME = app?.name ?? 'ASGARDEX'

export const APP_DATA_DIR = path.join(app?.getPath('appData') ?? './testdata', APP_NAME)
export const STORAGE_DIR = path.join(APP_DATA_DIR, 'storage')
