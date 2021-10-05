import * as TE from 'fp-ts/lib/TaskEither'
import * as fs from 'fs-extra'

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
 * Writes a file.
 * If the parent directory does not exist, it will be created.
 *
 * Borrowed from https://github.com/gcanti/fp-ts-node/blob/master/src/fs.ts
 * Note: `fp-ts-node` is not available on npm
 */
export const writeFile: (path: string, data: string, options?: fs.WriteFileOptions) => TE.TaskEither<Error, void> =
  TE.taskify<string, string, fs.WriteFileOptions | undefined, Error, void>(fs.outputFile)
