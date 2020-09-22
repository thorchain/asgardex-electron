const suffixes = ['', 'K', 'M', 'B', 't', 'q', 'Q', 's']

export const abbreviateNumber = (value: number, decimal = 0): string => {
  let newValue = value
  let suffixNum = 0

  while (newValue >= 1000) {
    newValue /= 1000
    suffixNum++
  }

  return `${newValue.toFixed(decimal)}${suffixNum > 0 ? ` ${suffixes[suffixNum]}` : ''}`
}

export const abbreviateNumberFromString = (value: string, decimal = 2): string => {
  const num = parseFloat(value.replace(/,/g, ''))
  return abbreviateNumber(num, decimal)
}
