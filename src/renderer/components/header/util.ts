import { assetFromString } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { CURRENCY_SYMBOLS } from '../../const'
import * as API from '../../helpers/apiHelper'
import { OnlineStatus } from '../../services/app/types'
import { isBUSDAsset, PricePoolAsset } from '../../views/pools/types'

export const toHeaderCurrencyLabel = (asset: PricePoolAsset): string => {
  let ticker = assetFromString(asset)?.ticker ?? 'unknown'
  // special case BUSDB
  if (isBUSDAsset(asset)) ticker = 'USD'
  return `${CURRENCY_SYMBOLS[asset]} ${ticker}`
}

export const headerNetStatusSubheadline = ({
  url,
  onlineStatus,
  notConnectedTxt
}: {
  url: O.Option<string>
  onlineStatus: OnlineStatus
  notConnectedTxt: string
}) => {
  if (onlineStatus === OnlineStatus.OFF) return notConnectedTxt
  return FP.pipe(
    url,
    O.chain(API.getHostnameFromUrl),
    O.getOrElse(() => notConnectedTxt)
  )
}

export type HeaderNetStatusColor = 'green' | 'yellow' | 'red'
export const headerNetStatusColor = ({ url, onlineStatus }: { url: O.Option<string>; onlineStatus: OnlineStatus }) => {
  if (onlineStatus === OnlineStatus.OFF) return 'red'
  return O.isSome(url) ? 'green' : 'yellow'
}
