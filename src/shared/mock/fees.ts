import { assetAmount } from '@xchainjs/xchain-util'

import { TransferFees } from '../../renderer/services/binance/types'

/**
 * BNB fees
 **/
export const BNB_TRANSFER_FEES: TransferFees = {
  single: assetAmount(0.000375),
  multi: assetAmount(0.0003)
}
