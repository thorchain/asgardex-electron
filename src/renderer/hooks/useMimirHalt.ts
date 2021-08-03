import * as RD from '@devexperts/remote-data-ts'
import { assetAmount, assetToBase, BaseAmount } from '@xchainjs/xchain-util'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { useThorchainContext } from '../contexts/ThorchainContext'
import { THORCHAIN_DECIMAL } from '../helpers/assetHelper'
import { liveData } from '../helpers/rx/liveData'

export const LIQUIDITY_RUNE_BUFFER: BaseAmount = assetToBase(assetAmount('100000', THORCHAIN_DECIMAL)) // 100k

export type FundsCap = {
  reached: boolean
  pooledRuneAmount: BaseAmount
  maxPooledRuneAmount: BaseAmount
}

export type MimirHalt = { haltEthTrading: boolean; haltEthChain: boolean; haltThorChain: boolean }
export type MimirHaltRD = RD.RemoteData<Error, MimirHalt>

/**
 * Hook to get halt status defined by `Mimir`
 *
 * Note: Same rule as we have for services - Use this hook in top level *views only (but in child components)
 */
export const useMimirHalt = (): MimirHaltRD => {
  const { mimir$ } = useThorchainContext()

  const [data] = useObservableState<MimirHaltRD>(
    () =>
      mimir$.pipe(
        liveData.map((mimir) => ({
          haltThorChain: mimir['mimir//HALTTHORCHAIN'] === 1,
          haltEthChain: mimir['mimir//HALTETHCHAIN'] === 1,
          haltEthTrading: mimir['mimir//HALTETHTRADING'] === 1
        })),
        RxOp.shareReplay(1)
      ),
    RD.initial
  )

  return data
}
