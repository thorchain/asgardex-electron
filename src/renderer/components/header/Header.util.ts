import { currencySymbolByAsset } from '@xchainjs/xchain-util'

import { isUSDAsset } from '../../helpers/assetHelper'
import { OnlineStatus } from '../../services/app/types'
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
  onlineStatus: OnlineStatus
  notConnectedTxt: string
}) => (onlineStatus === OnlineStatus.ON ? url : notConnectedTxt)

export type HeaderNetStatusColor = 'green' | 'yellow'
export const headerNetStatusColor = ({ onlineStatus }: { onlineStatus: OnlineStatus }) =>
  onlineStatus === OnlineStatus.ON ? 'green' : 'yellow'

export const isClientOnline = (midgardStatus: OnlineStatus, thorchainStatus: OnlineStatus) =>
  midgardStatus === OnlineStatus.ON && thorchainStatus === OnlineStatus.ON
