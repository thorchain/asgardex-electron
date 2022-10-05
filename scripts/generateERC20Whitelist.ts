import { Asset, assetFromString, ETHChain } from '@xchainjs/xchain-util'
import ansis from 'ansis'
import axios from 'axios'
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
  'https://gitlab.com/thorchain/thornode/-/raw/release-1.97.2/common/tokenlist/ethtokens/eth_mainnet_V97.json'

const PATH = './src/renderer/types/generated/thorchain/erc20whitelist.ts'

type AssetList = { asset: Asset; iconUrl: O.Option<string> }[]

const transformList = ({ tokens }: Pick<ERC20Whitelist, 'tokens'>): AssetList =>
  FP.pipe(
    tokens,
    A.filterMap(({ address, symbol, logoURI }) =>
      FP.pipe(
        assetFromString(`${ETHChain}.${symbol}-${address}`),
        O.fromNullable,
        O.map((asset) => ({ asset, iconUrl: O.fromNullable(logoURI) }))
      )
    )
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

const createTemplate = (list: AssetList): string => {
  const listAsString = FP.pipe(
    list,
    A.map(({ asset, iconUrl }) => {
      const iconUrlString = FP.pipe(
        iconUrl,
        O.fold(
          () => 'O.none',
          (iconUrl) => `O.some('${iconUrl}')`
        )
      )
      return `{asset: ${JSON.stringify(asset)}, iconUrl: ${iconUrlString}}`
    })
  )

  return `
    /**
     * ERC20_WHITELIST
     *
     * This file has been generated - don't edit.
     *
     */

    import * as O from 'fp-ts/lib/Option'
    import { Asset, ETHChain } from '@xchainjs/xchain-util'

    export const ERC20_WHITELIST: { asset: Asset, iconUrl: O.Option<string> }[] = [${listAsString}]
  `
}

const writeList = (list: AssetList): TE.TaskEither<Error, void> =>
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
      C.log(ansis.bold.red('Unexpected Error!')),
      IO.chain(() => C.error(e))
    )
  )

const onSuccess = (): T.Task<void> =>
  T.fromIO(
    FP.pipe(
      C.info(ansis.green.bold(`Created whitelist successfully!`)),
      IO.chain(() => C.log(`Location: ${PATH}`))
    )
  )

const main = FP.pipe(
  C.info(ansis.italic.gray(`Generate whitelist...`)),
  TE.fromIO,
  TE.mapLeft(E.toError),
  TE.chain(loadList),
  TE.map(transformList),
  TE.chain(writeList),
  TE.chain(formatList),
  TE.fold(onError, onSuccess)
)

main()
