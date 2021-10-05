import { Asset, assetFromString, ETHChain } from '@xchainjs/xchain-util'
import axios from 'axios'
import chalk from 'chalk'
import * as IO from 'fp-ts/IO'
import * as A from 'fp-ts/lib/Array'
import * as C from 'fp-ts/lib/Console'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as TE from 'fp-ts/lib/TaskEither'
import * as S from 'fp-ts/string'
import * as T from 'fp-ts/Task'
import { failure } from 'io-ts/lib/PathReporter'
import prettier from 'prettier'

import { writeFile, readFile } from '../src/main/utils/file'
import { ERC20Whitelist, erc20WhitelistIO } from '../src/renderer/services/thorchain/types'

const WHITELIST_URL =
  'https://gitlab.com/thorchain/thornode/-/raw/develop/bifrost/pkg/chainclients/ethereum/token_list.json'

const PATH = './src/renderer/types/generated/thorchain/erc20whitelist.ts'

const transformList = ({ tokens }: Pick<ERC20Whitelist, 'tokens'>): Asset[] =>
  FP.pipe(
    tokens,
    A.filterMap(({ address, symbol }) => FP.pipe(assetFromString(`${ETHChain}.${symbol}-${address}`), O.fromNullable))
  )

const loadList = (): TE.TaskEither<Error, ERC20Whitelist> =>
  FP.pipe(
    TE.tryCatch(
      () => axios.get<ERC20Whitelist>(WHITELIST_URL),
      (e: unknown) => new Error(`${e}`)
    ),
    TE.chain((resp) =>
      FP.pipe(
        erc20WhitelistIO.decode(resp.data),
        E.mapLeft((errors) => new Error(failure(errors).join('\n'))),
        TE.fromEither
      )
    )
  )

const createTemplate = (list: Asset[]): string => `
/**
 * ERC20Whitelist
 *
 * This file has been generated - don't edit.
 *
 */

import { Asset, ETHChain } from '@xchainjs/xchain-util'

export const ERC20Whitelist: Asset[] = ${JSON.stringify(list)}
`

const writeList = (list: Asset[]): TE.TaskEither<Error, void> =>
  FP.pipe(
    list,
    createTemplate,
    // "ETH" _> ETHChain
    S.replace(/"chain":"ETH"/g, 'chain: ETHChain'),
    (c) => writeFile(PATH, c)
  )

const formatList = () =>
  FP.pipe(
    readFile(PATH, 'utf8'),
    TE.chain((content) => writeFile(PATH, prettier.format(content, { filepath: PATH })))
  )

const onError = (e: Error): T.Task<void> =>
  T.fromIO(
    FP.pipe(
      C.log(chalk.bold.red('Unexpected Error!')),
      IO.chain(() => C.error(e))
    )
  )

const onSuccess = (): T.Task<void> =>
  T.fromIO(
    FP.pipe(
      C.info(chalk.green.bold(`Created whitelist successfully!`)),
      IO.chain(() => C.log(`Location: ${PATH}`))
    )
  )

const main = FP.pipe(
  loadList(),
  TE.map(transformList),
  TE.chain(writeList),
  TE.chain(formatList),
  TE.fold(onError, onSuccess)
)

main()
