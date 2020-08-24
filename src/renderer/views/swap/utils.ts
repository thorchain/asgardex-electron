const getAssetFormat = (symbol: string) => {
  return `BNB.${symbol}`
}

export const getSwapMemo = (symbol: string, addr: string, sliplimit = '') => {
  return `SWAP:${getAssetFormat(symbol)}:${addr}:${sliplimit}`
}
