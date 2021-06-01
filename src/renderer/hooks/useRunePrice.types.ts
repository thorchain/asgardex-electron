import * as RD from '@devexperts/remote-data-ts'
import * as O from 'fp-ts/lib/Option'

import { AssetWithAmount } from '../types/asgardex'

export type RunePriceRD = RD.RemoteData<Error, O.Option<AssetWithAmount>>
