enum IPCMessages {
  // lang
  UPDATE_LANG = 'UPDATE_LANG',
  // keystore
  LOAD_KEYSTORE = 'LOAD_KEYSTORE',
  SAVE_KEYSTORE_WALLETS = 'SAVE_KEYSTORE_WALLETS',
  EXPORT_KEYSTORE = 'EXPORT_KEYSTORE',
  INIT_KEYSTORE_WALLETS = 'INIT_KEYSTORE_WALLETS',
  // URL
  OPEN_EXTERNAL_URL = 'OPEN_EXTERNAL_URL',
  // Ledger
  GET_LEDGER_ADDRESS = 'GET_LEDGER_ADDRESS',
  VERIFY_LEDGER_ADDRESS = 'VERIFY_LEDGER_ADDRESS',
  SEND_LEDGER_TX = 'SEND_LEDGER_TX',
  DEPOSIT_LEDGER_TX = 'DEPOSIT_LEDGER_TX',
  APPROVE_LEDGER_ERC20_TOKEN = 'APPROVE_LEDGER_ERC20',
  SAVE_LEDGER_ADDRESSES = 'SAVE_LEDGER_ADDRESSES',
  GET_LEDGER_ADDRESSES = 'GET_LEDGER_ADDRESSES',
  // Update
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
