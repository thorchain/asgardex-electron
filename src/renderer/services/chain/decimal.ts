import * as RD from '@devexperts/remote-data-ts'
import { BNBChain } from '@xchainjs/xchain-binance'
import { BTC_DECIMAL } from '@xchainjs/xchain-bitcoin'
import { BTCChain } from '@xchainjs/xchain-bitcoin'
import { BCH_DECIMAL } from '@xchainjs/xchain-bitcoincash'
import { BCHChain } from '@xchainjs/xchain-bitcoincash'
import { COSMOS_DECIMAL } from '@xchainjs/xchain-cosmos'
import { GAIAChain } from '@xchainjs/xchain-cosmos'
import { DOGE_DECIMAL } from '@xchainjs/xchain-doge'
import { DOGEChain } from '@xchainjs/xchain-doge'
import { ETHChain } from '@xchainjs/xchain-ethereum'
import { LTC_DECIMAL } from '@xchainjs/xchain-litecoin'
import { LTCChain } from '@xchainjs/xchain-litecoin'
import { MAYAChain } from '@xchainjs/xchain-mayachain'
import { THORChain } from '@xchainjs/xchain-thorchain'
import { Asset } from '@xchainjs/xchain-util'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { isEnabledChain } from '../../../shared/utils/chain'
import { BNB_DECIMAL, THORCHAIN_DECIMAL } from '../../helpers/assetHelper'
import { getERC20Decimal } from '../ethereum/common'
import { AssetWithDecimalLD } from './types'

const getDecimal = (asset: Asset, network: Network): Promise<number> => {
  const { chain } = asset
  if (!isEnabledChain(chain)) return Promise.reject(`${chain} is not supported for 'getDecimal'`)

  switch (chain) {
    case BNBChain:
      return Promise.resolve(BNB_DECIMAL)
    case BTCChain:
      return Promise.resolve(BTC_DECIMAL)
    case ETHChain:
      return getERC20Decimal(asset, network)
    case THORChain:
    case MAYAChain:
      return Promise.resolve(THORCHAIN_DECIMAL)
    case DOGEChain:
      return Promise.resolve(DOGE_DECIMAL)
    case GAIAChain:
      return Promise.resolve(COSMOS_DECIMAL)
    case BCHChain:
      return Promise.resolve(BCH_DECIMAL)
    case LTCChain:
      return Promise.resolve(LTC_DECIMAL)
    default:
      return Promise.reject(`${chain} is not supported for 'getDecimal'`)
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
