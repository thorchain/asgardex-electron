import IPCMessages from '../../main/ipc/messages'
import { StoreFileName } from '../api/types'

/**
 * Common shared IPC massages factory to avoid possible inconsistency
 * between electron and renderer parts
 * @param fileName
 */
export const getStoreFilesIPCMessages = (fileName: StoreFileName) => {
  return {
    SAVE_FILE: `${IPCMessages.SAVE_FILE_}${fileName.toUpperCase()}`,
    REMOVE_FILE: `${IPCMessages.REMOVE_FILE_}${fileName.toUpperCase()}`,
    GET_FILE: `${IPCMessages.GET_FILE_}${fileName.toUpperCase()}`,
    FILE_EXIST: `${IPCMessages.FILE_EXIST_}${fileName.toUpperCase()}`
  } as const
}
