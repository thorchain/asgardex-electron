export const shortSymbol = (symbol: string) => {
  return symbol?.split('-')[0].substr(0, 4)
}
