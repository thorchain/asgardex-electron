import * as path from 'path'

import { ipcRenderer } from 'electron'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import * as fs from 'fs-extra'

import { IPCKeystoresLedgerAddressesIO, ipcKeystorLedgerAddressesIO } from '../../shared/api/io'
import { IPCLedgerAdddressParams } from '../../shared/api/types'
import { ApiHDWallet } from '../../shared/api/types'
import { mapIOErrors } from '../../shared/utils/fp'
import IPCMessages from '../ipc/messages'
import { writeJSON } from '../utils/file'
import { STORAGE_DIR } from './const'

const LEDGERS_STORAGE_FILE = path.join(STORAGE_DIR, `ledgers.json`)

export const getLedgerAddresses: TE.TaskEither<Error, IPCKeystoresLedgerAddressesIO> = FP.pipe(
  TE.tryCatch(
    async () => {
      const exists = await fs.pathExists(LEDGERS_STORAGE_FILE)
      // empty list if `ledgers.json` does not exist
      return exists ? fs.readJSON(LEDGERS_STORAGE_FILE) : []
    },
    (e: unknown) => Error(`${e}`)
  ),
  TE.chain(FP.flow(ipcKeystorLedgerAddressesIO.decode, E.mapLeft(mapIOErrors), TE.fromEither))
)

/**
 * Saves ledger addresses bind to keystore wallets
 * It returns a list of ledger addresses
 */
export const saveLedgerAddresses = (
  ledgers: IPCKeystoresLedgerAddressesIO
): TE.TaskEither<Error, IPCKeystoresLedgerAddressesIO> =>
  // 1. encode ledgers
  FP.pipe(ledgers, ipcKeystorLedgerAddressesIO.encode, (ledgersEncoded) =>
    FP.pipe(
      // 2. save ledgers to disk
      writeJSON(`${LEDGERS_STORAGE_FILE}`, ledgersEncoded),
      // return ledgers
      TE.map((_) => ledgers)
    )
  )

export const apiHDWallet: ApiHDWallet = {
  getLedgerAddress: (params: IPCLedgerAdddressParams) => ipcRenderer.invoke(IPCMessages.GET_LEDGER_ADDRESS, params),
  verifyLedgerAddress: (params: IPCLedgerAdddressParams) =>
    ipcRenderer.invoke(IPCMessages.VERIFY_LEDGER_ADDRESS, params),
  // Note: `params` need to be encoded by `ipcLedgerSendTxParamsIO` before calling `sendLedgerTx` */
  sendLedgerTx: (params: unknown) => ipcRenderer.invoke(IPCMessages.SEND_LEDGER_TX, params),
  // Note: `params` need to be encoded by `ipcLedgerDepositTxParams` before calling `depositLedgerTx` */
  depositLedgerTx: (params: unknown) => ipcRenderer.invoke(IPCMessages.DEPOSIT_LEDGER_TX, params),
  // Note: `params` need to be encoded by `ipcLedgerApproveERC20TokenParamsIO` before calling `approveLedgerERC20Token` */
  approveLedgerERC20Token: (params: unknown) => ipcRenderer.invoke(IPCMessages.APPROVE_LEDGER_ERC20_TOKEN, params),
  // Note: `params` need to be encoded by `ipcKeystorLedgerAddressesIO` before calling `saveLedgerAddresses` */
  saveLedgerAddresses: (params: unknown) => ipcRenderer.invoke(IPCMessages.SAVE_LEDGER_ADDRESSES, params),
  getLedgerAddresses: () => ipcRenderer.invoke(IPCMessages.GET_LEDGER_ADDRESSES)
}
