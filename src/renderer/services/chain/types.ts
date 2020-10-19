import { BaseAmount } from '@thorchain/asgardex-util'

import { LiveData } from '../../helpers/rx/liveData'

export type LoadFeesHandler = () => void

export type FeeLD = LiveData<Error, BaseAmount>
