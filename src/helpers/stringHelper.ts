import { Maybe, Nothing, Pair } from '../types/asgardex.d'

export const getPair = (info?: string): Pair => ({
  source: info?.split('-')[0]?.toLowerCase() ?? Nothing,
  target: info?.split('-')[1]?.toLowerCase() ?? Nothing
})

export const getTickerFormat = (symbol?: Maybe<string>): string | null => {
  if (!symbol) return null
  if (symbol.includes('.')) {
    return symbol.split('.')[1].split('-')[0].toLowerCase()
  }

  return symbol.split('-')[0].toLowerCase()
}

export const compareShallowStr = (str1: string, str2: string): boolean => {
  try {
    return str1.toLowerCase() === str2.toLowerCase()
  } catch (error) {
    return false
  }
}

export const emptyString = ''
