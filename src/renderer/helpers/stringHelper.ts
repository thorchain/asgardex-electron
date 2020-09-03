import { Option, none, some, fromNullable } from 'fp-ts/lib/Option'

import { Pair } from '../types/asgardex'

export const getPair = (info?: string): Pair => ({
  source: fromNullable(info?.split('-')[0]?.toLowerCase()),
  target: fromNullable(info?.split('-')[1]?.toLowerCase())
})

export const getTickerFormat = (symbol?: string): Option<string> => {
  if (!symbol) return none
  if (symbol.includes('.')) {
    return some(symbol.split('.')[1].split('-')[0].toLowerCase())
  }

  return some(symbol.split('-')[0].toLowerCase())
}

export const compareShallowStr = (str1: string, str2: string): boolean => {
  try {
    return str1.toLowerCase() === str2.toLowerCase()
  } catch (error) {
    return false
  }
}

export const emptyString = ''

/**
 * Removes leading / trailing zeros from a string of numbers
 * (1) Regex to remove trailing zeros https://stackoverflow.com/a/53397618/2032698
 * (2) Regex to remove leading zeros https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch06s06.html
 */
export const trimZeros = (value: string) =>
  value
    // (1) remove trailing zeros
    .replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1')
    // (2) remove leading zeros
    .replace(/\b0*([1-9][0-9]*|0)\b/, '$1')
