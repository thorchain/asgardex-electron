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
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { BNB_DECIMAL, isEthAsset, isEthTokenAsset, THORCHAIN_DECIMAL } from '../../helpers/assetHelper'
import { LiveData } from '../../helpers/rx/liveData'
import { AssetWithDecimal } from '../../types/asgardex'

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
      if (isEthTokenAsset(asset)) return Promise.reject(Error('Decimals for ERC20 has not been implemented yet'))
      // unknown
      return Promise.reject(Error(`Unknown asset: ${assetToString(asset)}`))
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

export const decimal$ = (asset: Asset, network: Network): LiveData<Error, AssetWithDecimal> =>
  Rx.from(getDecimal(asset, network)).pipe(
    RxOp.map((decimal) =>
      RD.success({
        asset,
        decimal
      })
    ),
    RxOp.catchError((error) => Rx.of(RD.failure(error?.msg ?? error.toString())))
  )
