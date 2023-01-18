import * as RD from '@devexperts/remote-data-ts'
import { BTC_DECIMAL } from '@xchainjs/xchain-bitcoin'
import { BCH_DECIMAL } from '@xchainjs/xchain-bitcoincash'
import { COSMOS_DECIMAL } from '@xchainjs/xchain-cosmos'
import { DOGE_DECIMAL } from '@xchainjs/xchain-doge'
import { LTC_DECIMAL } from '@xchainjs/xchain-litecoin'
import { Asset } from '@xchainjs/xchain-util'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import {
  AvalancheChain,
  BCHChain,
  BNBChain,
  BTCChain,
  CosmosChain,
  DOGEChain,
  ETHChain,
  LTCChain,
  THORChain
} from '../../../shared/utils/chain'
import { BNB_DECIMAL, THORCHAIN_DECIMAL } from '../../helpers/assetHelper'
import { getERC20Decimal } from '../ethereum/common'
import { AssetWithDecimalLD } from './types'

const getDecimal = (asset: Asset, network: Network): Promise<number> => {
  switch (asset.chain) {
    case BNBChain:
      return Promise.resolve(BNB_DECIMAL)
    case BTCChain:
      return Promise.resolve(BTC_DECIMAL)
    case ETHChain:
      return getERC20Decimal(asset, network)
    case THORChain:
      return Promise.resolve(THORCHAIN_DECIMAL)
    case DOGEChain:
      return Promise.resolve(DOGE_DECIMAL)
    case CosmosChain:
      return Promise.resolve(COSMOS_DECIMAL)
    case BCHChain:
      return Promise.resolve(BCH_DECIMAL)
    case LTCChain:
      return Promise.resolve(LTC_DECIMAL)
    case AvalancheChain: {
      return Promise.reject('AVAX is not supported yet')
    }
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
    RxOp.catchError((error) => Rx.of(RD.failure(error?.msg ?? error.toString()))),
    RxOp.startWith(RD.pending)
  )
