import * as RD from '@devexperts/remote-data-ts'
import { BaseAmount } from '@thorchain/asgardex-util'

import { LiveData } from '../../helpers/rx/liveData'

export type LoadFeesHandler = () => void

export type FeeRD = RD.RemoteData<Error, BaseAmount>
export type FeeLD = LiveData<Error, BaseAmount>
