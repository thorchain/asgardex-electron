import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as N from 'fp-ts/lib/number'
import * as O from 'fp-ts/lib/Option'

import { KeystoreId, KeystoreIds } from '../api/types'
import { naturalNumberFromNullableString } from './fp'

/**
 * Validate file names of keystores - incl. extensions
 *
 * Valid names are:
 * `keystore-{digit}.json|JSON`
 * `keystore.json|JSON` (legacy name)
 * */
export const validateKeystoreFileName = (fileName: string): boolean =>
  // Matches (order is important):
  // 1. `keystore` at the beginning (REQUIRED)
  // 2. `-` (dash) (OPTIONAL)
  // 3.  any `digit` (OPTIONAL)
  // 4. `json` or `JSON` as file extension (REQUIRED)
  Boolean(fileName.match(/^keystore(-[0-9]+)?\.(json|JSON)/))

export const isLegacyKeystoreFileName = (fileName: string): boolean => Boolean(fileName.match(/keystore.(json|JSON)/))

export const getKeystoreIdFromFileName = (fileName: string): O.Option<KeystoreId> => {
  const regex = /^(keystore-)(.*?)(.json|JSON)/
  return FP.pipe(
    fileName,
    // make sure file name is valid
    O.fromPredicate(validateKeystoreFileName),
    O.map((f) =>
      // Support legacy `keystore.json` file -> id == 1
      isLegacyKeystoreFileName(f)
        ? '1'
        : // get id from `keystore-{id}.json|JSON`
          f.replace(regex, '$2')
    ),
    O.chain(naturalNumberFromNullableString)
  )
}

/**
 * Filters keystore files from a arbitrary list of file names
 *
 * Ordered by ids starting by lowest (oldest)
 *
 */
export const keystoreIdsFromFileNames = (fileNames: string[]): KeystoreIds =>
  FP.pipe(fileNames, A.filterMap(getKeystoreIdFromFileName), A.sort(N.Ord))
