import { currencySymbolByAsset } from '@xchainjs/xchain-util'

import { isUSDAsset } from '../../helpers/assetHelper'
import { PricePoolAsset } from '../../views/pools/Pools.types'

export const toHeaderCurrencyLabel = (asset: PricePoolAsset): string => {
  // special case USD* assets
  const symbol = currencySymbolByAsset(asset)
  const label = isUSDAsset(asset) ? 'USD' : asset.ticker
  return `${symbol} ${label}`
}

export const headerNetStatusSubheadline = ({
  url,
  onlineStatus,
  notConnectedTxt
}: {
  url: string
  onlineStatus: boolean
  notConnectedTxt: string
}) => (onlineStatus ? url : notConnectedTxt)

export type HeaderNetStatusColor = 'green' | 'red'
export const headerNetStatusColor = ({ onlineStatus }: { onlineStatus: boolean }) => (onlineStatus ? 'green' : 'red')
