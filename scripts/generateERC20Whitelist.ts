import { assetFromString, ETHChain } from '@xchainjs/xchain-util'
import axios from 'axios'
import * as A from 'fp-ts/lib/Array'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as TE from 'fp-ts/lib/TaskEither'
import { failure } from 'io-ts/lib/PathReporter'

import { ERC20AssetWhiteList, ERC20Whitelist, erc20WhitelistIO } from '../src/renderer/services/thorchain/types'

const url = 'https://gitlab.com/thorchain/thornode/-/raw/develop/bifrost/pkg/chainclients/ethereum/token_list.json'

const transformList = ({ tokens }: Pick<ERC20Whitelist, 'tokens'>): ERC20AssetWhiteList =>
  FP.pipe(
    tokens,
    A.filterMap(({ address, symbol }) => FP.pipe(assetFromString(`${ETHChain}.${symbol}-${address}`), O.fromNullable))
  )

const loadList = (): TE.TaskEither<Error, ERC20Whitelist> =>
  FP.pipe(
    TE.tryCatch(
      () => axios.get<ERC20Whitelist>(url),
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

const writeList = (list: ERC20AssetWhiteList) => {
  // TODO write list to disk
  console.log('write list', list)
  return Promise.resolve()
}

const main = async () => await FP.pipe(loadList(), TE.map(transformList), TE.map(writeList))()

main()
