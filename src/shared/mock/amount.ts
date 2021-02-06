import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { THORCHAIN_DECIMAL } from '../../renderer/helpers/assetHelper'

export const ONE_RUNE_AMOUNT = assetAmount(1, THORCHAIN_DECIMAL)
export const ONE_RUNE_BASE_AMOUNT = assetToBase(ONE_RUNE_AMOUNT)

export const TWO_RUNE_AMOUNT = assetAmount(2, THORCHAIN_DECIMAL)
export const TWO_RUNE_BASE_AMOUNT = assetToBase(TWO_RUNE_AMOUNT)

export const THREE_RUNE_AMOUNT = assetAmount(3, THORCHAIN_DECIMAL)
export const THREE_RUNE_BASE_AMOUNT = assetToBase(THREE_RUNE_AMOUNT)

export const FOUR_RUNE_AMOUNT = assetAmount(4, THORCHAIN_DECIMAL)
export const FOUR_RUNE_BASE_AMOUNT = assetToBase(FOUR_RUNE_AMOUNT)
