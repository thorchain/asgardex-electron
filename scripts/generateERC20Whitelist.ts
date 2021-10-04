import { Asset, assetFromString, ETHChain } from '@xchainjs/xchain-util'
import axios from 'axios'
import chalk from 'chalk'
import * as A from 'fp-ts/lib/Array'
import * as C from 'fp-ts/lib/Console'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as TE from 'fp-ts/lib/TaskEither'
import * as fs from 'fs-extra'
import { failure } from 'io-ts/lib/PathReporter'
import prettier from 'prettier'

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

const writeList = (list: Asset[]): TE.TaskEither<Error, void> => {
  const content = `
/**
 * ERC20Whitelist
 *
 * This file has been generated - don't edit.
 *
 */

import { Asset, ETHChain } from '@xchainjs/xchain-util'

export const ERC20Whitelist: Asset[] = ${JSON.stringify(list)}

`.replace(/"chain":"ETH"/g, 'chain: ETHChain') // "ETH" _> ETHChain

  return FP.pipe(
    TE.tryCatch(
      () => fs.writeFile(PATH, content),
      (e: unknown) => new Error(`${e}`)
    )
  )
}

const formatList = () => {
  return FP.pipe(
    TE.tryCatch(
      () => fs.readFile(PATH, 'utf8'),
      (e: unknown) => new Error(`${e}`)
    ),
    TE.chain((content) =>
      TE.tryCatch(
        () => fs.writeFile(PATH, prettier.format(content, { filepath: PATH })),
        (e: unknown) => new Error(`${e}`)
      )
    )
  )
}

const main = async () =>
  await FP.pipe(
    loadList(),
    TE.map(transformList),
    TE.chain(writeList),
    TE.chain(formatList),
    // success output
    TE.map(FP.flow(C.info(chalk.green.bold(`Whitelist has been generated successfully!`)), C.log(`Location: ${PATH}`))),
    // error output
    TE.mapLeft((error) => FP.pipe(error, C.error(chalk.red.bold(`Error while generating whitelist!`)), C.log(error)))
  )()

main()
