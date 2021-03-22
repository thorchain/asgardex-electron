import { bn, formatBN, isValidBN, trimZeros } from '@xchainjs/xchain-util'

const VALUE_ZERO_DECIMAL = '0.'
export const VALUE_ZERO = '0'

/**
 * Formats given string of number
 * @param value - string of numbers
 * @param maxDecimal (optional) - Maximum of decimal (default 8 - trailing zeros will always be removed.
 *
 * ```ts
 * formatValue('1234567.89')  // output: '1,234,567.89'
 * formatValue('1.2345', 2)   // output: '1.23'
 * formatValue('0001.2000')   // output: '1.2'
 * formatValue('hello')       // output: '0'
 * formatValue('9ell9')       // output: '99'
 * formatValue('.')           // output: '0.'
 * formatValue('')            // output: '0'
 * ```
 **/
export const formatValue = (value: string, maxDecimal = 2) => {
  // remove non number characters (excluding `.` and `,`)
  value = value.replace(/[^\d.,]/g, '')

  // '' -> '0'
  if (value === '') return VALUE_ZERO
  // '.'  -> '0.'
  // '0.'  -> '0.'
  if (maxDecimal > 0 && (value === '.' || value === '0.')) return VALUE_ZERO_DECIMAL

  const valueBN = bn(value)
  // invalid BN  -> '0'
  if (!isValidBN(valueBN)) return VALUE_ZERO

  // format
  const formatted = formatBN(valueBN, maxDecimal)
  // and trim
  return trimZeros(formatted)
}

export const validInputValue = (value: string) => {
  if (value === '' || value === '.' || value === VALUE_ZERO_DECIMAL) return true

  return isValidBN(bn(value))
}
