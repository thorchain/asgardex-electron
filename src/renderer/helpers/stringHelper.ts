import { fromNullable } from 'fp-ts/lib/Option'

import { Pair } from '../types/asgardex'

export const getPair = (info?: string): Pair => ({
  source: fromNullable(info?.split('-')[0]?.toLowerCase()),
  target: fromNullable(info?.split('-')[1]?.toLowerCase())
})

export const compareShallowStr = (str1: string, str2: string): boolean => {
  try {
    return str1.toLowerCase() === str2.toLowerCase()
  } catch (error) {
    return false
  }
}

export const emptyString = ''
export const loadingString = '...'
