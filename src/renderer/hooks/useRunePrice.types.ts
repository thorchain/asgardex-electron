import * as RD from '@devexperts/remote-data-ts'

import { AssetWithAmount } from '../types/asgardex'

export type RunePriceRD = RD.RemoteData<Error, AssetWithAmount>
