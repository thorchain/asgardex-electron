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
 * Reads a JSON file.
 */
export const readJSON: (path: string, options?: fs.ReadOptions) => TE.TaskEither<Error, string> = TE.taskify<
  string,
  fs.ReadOptions | undefined,
  Error,
  string
>(fs.readJSON)

/**
 * Reads a directory
 */
export const readDir: (path: fs.PathLike) => TE.TaskEither<NodeJS.ErrnoException, string[]> = TE.taskify<
  fs.PathLike,
  NodeJS.ErrnoException,
  string[]
>(fs.readdir)

/**
 * Writes a file.
 * If the parent directory does not exist, it will be created.
 *
 * Borrowed from https://github.com/gcanti/fp-ts-node/blob/master/src/fs.ts
 * Note: `fp-ts-node` is not available on npm (issue https://github.com/gcanti/fp-ts-node/issues/10)
 */
export const writeFile: (path: string, data: string, options?: fs.WriteFileOptions) => TE.TaskEither<Error, void> =
  TE.taskify<string, string, fs.WriteFileOptions | undefined, Error, void>(fs.outputFile)

/**
 * Writes a JSON file.
 * If the parent directory does not exist, it will be created.
 */
export const writeJSON: (path: string, data: object, options?: fs.WriteOptions) => TE.TaskEither<Error, void> =
  TE.taskify<string, object, fs.WriteOptions | undefined, Error, void>(fs.outputJSON)

export const exists: (path: string) => TE.TaskEither<Error, boolean> = TE.taskify<string, Error, boolean>(fs.pathExists)

/**
 * Renames a file
 */
export const renameFile: (oldPath: fs.PathLike, newPath: fs.PathLike) => TE.TaskEither<Error, void> = TE.taskify<
  fs.PathLike,
  fs.PathLike,
  Error,
  void
>(fs.rename)
