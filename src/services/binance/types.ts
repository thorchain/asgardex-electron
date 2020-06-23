import * as RD from '@devexperts/remote-data-ts'
import { Balances } from '@thorchain/asgardex-binance'

export type BalancesRD = RD.RemoteData<Error, Balances>
