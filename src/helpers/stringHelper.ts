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

/**
 * Formats time in HH:MM:SS by given seconds
 *
 * @param sec number Time in seconds
 */
export const formatTimeFromSeconds = (sec: number) => {
  // return "empty" string for NaN values
  if (isNaN(sec)) {
    return '--:--:--'
  }

  const padZero = (value: number) => (value < 10 ? `0${value}` : value)

  const hours = Math.floor(sec / 3600)
  const minutes = Math.floor((sec - hours * 3600) / 60)
  const seconds = sec - hours * 3600 - minutes * 60

  return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`
}
