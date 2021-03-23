import * as RD from '@devexperts/remote-data-ts'
import { BTC_DECIMAL } from '@xchainjs/xchain-bitcoin'
import { BCH_DECIMAL } from '@xchainjs/xchain-bitcoincash'
import { DECIMAL as COSMOS_DECIMAL } from '@xchainjs/xchain-cosmos'
import { ETH_DECIMAL } from '@xchainjs/xchain-ethereum'
import { LTC_DECIMAL } from '@xchainjs/xchain-litecoin'
import { getDecimal as getDecimalDot } from '@xchainjs/xchain-polkadot'
import {
  BNBChain,
  CosmosChain,
  ETHChain,
  PolkadotChain,
  THORChain,
  BCHChain,
  LTCChain,
  Asset,
  assetToString,
  BTCChain
} from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { BNB_DECIMAL, getEthAssetAddress, isEthAsset, THORCHAIN_DECIMAL } from '../../helpers/assetHelper'
import { getERC20Decimal } from '../ethereum/common'
import { AssetWithDecimalLD } from './types'

const getDecimal = (asset: Asset, network: Network): Promise<number> => {
  switch (asset.chain) {
    case BNBChain:
      return Promise.resolve(BNB_DECIMAL)
    case BTCChain:
      return Promise.resolve(BTC_DECIMAL)
    case ETHChain:
      // ETH
      if (isEthAsset(asset)) return Promise.resolve(ETH_DECIMAL)
      // ERC20
      // Needs to be done with `xchain-js` first
      // see https://github.com/xchainjs/xchainjs-lib/issues/284
      return FP.pipe(
        getEthAssetAddress(asset),
        O.fold(
          () => Promise.reject(Error(`Unknown asset: ${assetToString(asset)}`)),
          (address) => getERC20Decimal(address, network)
        )
      )

    case THORChain:
      return Promise.resolve(THORCHAIN_DECIMAL)
    case PolkadotChain:
      return Promise.resolve(getDecimalDot(network === 'mainnet' ? 'mainnet' : 'testnet'))
    case CosmosChain:
      return Promise.resolve(COSMOS_DECIMAL)
    case BCHChain:
      return Promise.resolve(BCH_DECIMAL)
    case LTCChain:
      return Promise.resolve(LTC_DECIMAL)
  }
}

export const assetWithDecimal$ = (asset: Asset, network: Network): AssetWithDecimalLD =>
  Rx.from(getDecimal(asset, network)).pipe(
    RxOp.map((decimal) =>
      RD.success({
        asset,
        decimal
      })
    ),
    RxOp.catchError((error) => Rx.of(RD.failure(error?.msg ?? error.toString())))
  )
