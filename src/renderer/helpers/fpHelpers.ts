import * as RD from '@devexperts/remote-data-ts'
import { Lazy } from 'fp-ts/function'
import { sequenceS, sequenceT } from 'fp-ts/lib/Apply'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import * as TE from 'fp-ts/lib/TaskEither'
import * as fs from 'fs-extra'

/**
 * Sequence
 */

export const sequenceTOption = sequenceT(O.Apply)
export const sequenceTOptionFromArray = A.sequence(O.Applicative)
export const sequenceSOption = sequenceS(O.Applicative)

export const sequenceTRD = sequenceT(RD.remoteData)
export const sequenceTRDFromArray = A.sequence(RD.remoteData)

/**
 * Creation
 */
export const rdFromOption =
  <L, A>(onNone: Lazy<L>) =>
  (v: O.Option<A>) =>
    RD.fromOption(v, onNone)

export const rdAltOnPending =
  <L, A>(onPending: () => RD.RemoteData<L, A>) =>
  (rd: RD.RemoteData<L, A>): RD.RemoteData<L, A> => {
    if (RD.isPending(rd)) {
      return onPending()
    }
    return rd
  }

/**
 * @since 0.0.1
 */

/**
 * Reads a file.
 *
 * Borrowed from https://github.com/gcanti/fp-ts-node/blob/master/src/fs.ts
 * Note: `fp-ts-node` is not available on npm
 */
export const readFile: (path: string, encoding: string) => TE.TaskEither<Error, string> = TE.taskify<
  string,
  string,
  Error,
  string
>(fs.readFile)

/**
 * Write a file. Iif the parent directory does not exist, it will be created.
 *
 * Borrowed from https://github.com/gcanti/fp-ts-node/blob/master/src/fs.ts
 * Note: `fp-ts-node` is not available on npm
 */
export const writeFile: (path: string, data: string, options?: fs.WriteFileOptions) => TE.TaskEither<Error, void> =
  TE.taskify<string, string, fs.WriteFileOptions | undefined, Error, void>(fs.outputFile)
