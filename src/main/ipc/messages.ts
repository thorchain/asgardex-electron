enum IPCMessages {
  UPDATE_LANG = 'UPDATE_LANG',
  SAVE_KEYSTORE = 'SAVE_KEYSTORE',
  GET_KEYSTORE = 'GET_KEYSTORE',
  KEYSTORE_EXIST = 'KEYSTORE_EXIST',
  REMOVE_KEYSTORE = 'REMOVE_KEYSTORE',
  EXPORT_KEYSTORE = 'EXPORT_KEYSTORE',
  LOAD_KEYSTORE = 'LOAD_KEYSTORE',
  GET_LEDGER_ADDRESS = 'GET_LEDGER_ADDRESS',
  SEND_LEDGER_TX = 'SEND_LEDGER_TX',
  DEPOSIT_LEDGER_TX = 'DEPOSIT_LEDGER_TX',
  UPDATE_AVAILABLE = 'UPDATE_AVAILABLE',
  APP_CHECK_FOR_UPDATE = 'APP_CHECK_FOR_UPDATE',
  /**
   * IPC File interaction messages templates
   * @see getStoreFilesIPCMessages at /src/shared/ipc/fileStore.ts to check final results
   * to check registration check initIPC at src/main/electron.ts
   *
   */
  SAVE_FILE_ = 'SAVE_FILE_',
  GET_FILE_ = 'GET_FILE_',
  FILE_EXIST_ = 'FILE_EXIST_',
  REMOVE_FILE_ = 'REMOVE_FILE_'
  /**
   * IPC File interaction messages templates end
   */
}

export default IPCMessages
