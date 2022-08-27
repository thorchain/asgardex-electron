import * as path from 'path'

import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import * as fs from 'fs-extra'

import { IPCLedgerAddressesIO, ipcLedgerAddressesIO } from '../../../shared/api/io'
import { mapIOErrors } from '../../../shared/utils/fp'
import { isError } from '../../../shared/utils/guard'
import { writeJSON } from '../../utils/file'
import { STORAGE_DIR } from '../const'

const LEDGERS_STORAGE_FILE = path.join(STORAGE_DIR, `ledgers.json`)

export const getAddresses: TE.TaskEither<Error, IPCLedgerAddressesIO> = FP.pipe(
  TE.tryCatch(
    async () => {
      const exists = await fs.pathExists(LEDGERS_STORAGE_FILE)
      // empty list if `ledgers.json` does not exist
      return exists ? fs.readJSON(LEDGERS_STORAGE_FILE) : []
    },
    (error: unknown) => (isError(error) ? error : Error(`${error}`))
  ),
  TE.chain(FP.flow(ipcLedgerAddressesIO.decode, E.mapLeft(mapIOErrors), TE.fromEither))
)

/**
 * Saves ledger addresses bind to keystore wallets
 * It returns a list of ledger addresses
 */
export const saveAddresses = (ledgers: IPCLedgerAddressesIO): TE.TaskEither<Error, IPCLedgerAddressesIO> =>
  // 1. encode ledgers
  FP.pipe(ledgers, ipcLedgerAddressesIO.encode, (ledgersEncoded) =>
    FP.pipe(
      // 2. save ledgers to disk
      writeJSON(`${LEDGERS_STORAGE_FILE}`, ledgersEncoded),
      // return ledgers
      TE.map((_) => ledgers)
    )
  )
