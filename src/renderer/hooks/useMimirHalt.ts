import { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { useThorchainContext } from '../contexts/ThorchainContext'
import { liveData } from '../helpers/rx/liveData'
import { DEFAULT_MIMIR_HALT } from '../services/thorchain/const'
import { Mimir, MimirHaltRD, MimirHalt } from '../services/thorchain/types'

/**
 * Hook to get halt status defined by `Mimir`
 *
 * Note: Same rule as we have for services - Use this hook in top level *views only (but in child components)
 */
export const useMimirHalt = (): { mimirHaltRD: MimirHaltRD; mimirHalt: MimirHalt } => {
  const { mimir$ } = useThorchainContext()

  const [mimirHaltRD] = useObservableState<MimirHaltRD>(
    () =>
      FP.pipe(
        mimir$,
        liveData.map<Mimir, MimirHalt>((mimir) => ({
          // TODO (@veado) Remove deprecated 'mimir://...' keys when THORNode v0.78.0 is out
          // `HALT{chain}CHAIN` flags
          haltBnbChain: mimir.HALTBNBCHAIN === 1 || mimir['mimir//HALTBNBCHAIN'] === 1,
          haltBchChain: mimir.HALTBCHCHAIN === 1 || mimir['mimir//HALTBCHCHAIN'] === 1,
          haltBtcChain: mimir.HALTBTCCHAIN === 1 || mimir['mimir//HALTBTCCHAIN'] === 1,
          haltEthChain: mimir.HALTETHCHAIN === 1 || mimir['mimir//HALTETHCHAIN'] === 1,
          haltLtcChain: mimir.HALTLTCCHAIN === 1 || mimir['mimir//HALTLTCCHAIN'] === 1,
          haltThorChain: mimir.HALTTHORCHAIN === 1 || mimir['mimir//HALTTHORCHAIN'] === 1,
          // `HALT{chain}TRADING` flags
          haltTrading: mimir.HALTTRADING === 1 || mimir['mimir//HALTTRADING'] === 1,
          haltBnbTrading: mimir.HALTBNBTRADING === 1 || mimir['mimir//HALTBNBTRADING'] === 1,
          haltBchTrading: mimir.HALTBCHTRADING === 1 || mimir['mimir//HALTBCHTRADING'] === 1,
          haltBtcTrading: mimir.HALTBTCTRADING === 1 || mimir['mimir//HALTBTCTRADING'] === 1,
          haltEthTrading: mimir.HALTETHTRADING === 1 || mimir['mimir//HALTETHTRADING'] === 1,
          haltLtcTrading: mimir.HALTLTCTRADING === 1 || mimir['mimir//HALTLTCTRADING'] === 1,
          // `PAUSELP{chain}` flags
          pauseLp: mimir.PAUSELP === 1 || mimir['mimir//PAUSELP'] === 1,
          pauseLpBnb: mimir.PAUSELPBNB === 1 || mimir['mimir//PAUSELPBNB'] === 1,
          pauseLpBch: mimir.PAUSELPBCH === 1 || mimir['mimir//PAUSELPBCH'] === 1,
          pauseLpBtc: mimir.PAUSELPBTC === 1 || mimir['mimir//PAUSELPBTC'] === 1,
          pauseLpEth: mimir.PAUSELPETH === 1 || mimir['mimir//PAUSELPETH'] === 1,
          pauseLpLtc: mimir.PAUSELPLTC === 1 || mimir['mimir//PAUSELPLTC'] === 1
        })),
        RxOp.shareReplay(1)
      ),
    RD.initial
  )

  const mimirHalt = useMemo(
    () =>
      FP.pipe(
        mimirHaltRD,
        RD.toOption,
        O.getOrElse<MimirHalt>(() => DEFAULT_MIMIR_HALT)
      ),
    [mimirHaltRD]
  )

  return { mimirHaltRD, mimirHalt }
}
