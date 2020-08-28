import { bn, bnOrZero, formatBN, isValidBN } from '@thorchain/asgardex-util'

import { trimZeros } from '../../../../helpers/stringHelper'

const VALUE_ZERO_DECIMAL = '0.'
export const VALUE_ZERO = '0'

export const formatValue = (value: string) => {
  // '0'  by default
  if (value === '') return VALUE_ZERO
  // '.'  -> '0.'
  if (value === '.') return VALUE_ZERO_DECIMAL

  // remove non number characters (excluding `.`, `,`)
  value = value.replace(/[^\d.,]/g, '')
  const decimal = value.match(/./g)
  if (!decimal && bnOrZero(value).isEqualTo(0)) return VALUE_ZERO

  const formatted = formatBN(bn(value), 8)
  return trimZeros(formatted)
}

export const validValue = (value: string) => {
  if (value === '') return true
  if (value === VALUE_ZERO_DECIMAL) return true

  return isValidBN(bn(value))
}
