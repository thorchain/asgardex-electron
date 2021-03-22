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

import { Network } from '../../../shared/api/types'
import { BNB_DECIMAL, isEthAsset, isEthTokenAsset, THORCHAIN_DECIMAL } from '../../helpers/assetHelper'
import { LiveData } from '../../helpers/rx/liveData'

export const decimal$ = (asset: Asset, network: Network): LiveData<Error, number> => {
  switch (asset.chain) {
    case BNBChain:
      return Rx.of(RD.success(BNB_DECIMAL))
    case BTCChain:
      return Rx.of(RD.success(BTC_DECIMAL))
    case ETHChain:
      if (isEthAsset(asset)) return Rx.of(RD.success(ETH_DECIMAL))
      if (isEthTokenAsset(asset)) return Rx.of(RD.failure(Error('Decimals for ERC20 has not been implemented yet')))
      return Rx.of(RD.failure(Error(`Unknown asset: ${assetToString(asset)}`)))
    case THORChain:
      return Rx.of(RD.success(THORCHAIN_DECIMAL))
    case PolkadotChain:
      return Rx.of(RD.success(getDecimalDot(network === 'mainnet' ? 'mainnet' : 'testnet')))
    case CosmosChain:
      return Rx.of(RD.success(COSMOS_DECIMAL))
    case BCHChain:
      return Rx.of(RD.success(BCH_DECIMAL))
    case LTCChain:
      return Rx.of(RD.success(LTC_DECIMAL))
  }
}
