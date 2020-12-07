import { assetAmount } from '@xchainjs/xchain-util'

import { TransferFees } from '../../renderer/services/binance/types'

/**
 * @deprecated
 * TODO(@Veado) Remove it
 **/
export const TRANSFER_FEES: TransferFees = {
  single: assetAmount(0.000375),
  multi: assetAmount(0.0003)
}
