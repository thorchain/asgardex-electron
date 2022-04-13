import { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { useMidgardContext } from '../contexts/MidgardContext'
import { useThorchainContext } from '../contexts/ThorchainContext'
import { sequenceTRD } from '../helpers/fpHelpers'
import { DEFAULT_MIMIR_HALT } from '../services/thorchain/const'
import { MimirHaltRD, MimirHalt } from '../services/thorchain/types'

/**
 * Helper to check Mimir status by given Mimir value and last height
 */
export const getMimirStatus = (mimir = 0, lastHeight = 0) => {
  // no mimir -> no action
  if (mimir === 0) return false
  // 1 -> halt | pause
  if (mimir === 1) return true
  // compare to current block height
  if (mimir < lastHeight) return true
  // No action for other cases
  return false
}
/**
 * Hook to get halt status defined by `Mimir`
 *
 * Note: Same rule as we have for services - Use this hook in top level *views only (but in child components)
 */
export const useMimirHalt = (): { mimirHaltRD: MimirHaltRD; mimirHalt: MimirHalt } => {
  const { mimir$ } = useThorchainContext()

  const {
    service: { thorchainLastblockState$ }
  } = useMidgardContext()

  const [mimirHaltRD] = useObservableState<MimirHaltRD>(
    () =>
      FP.pipe(
        Rx.combineLatest([mimir$, thorchainLastblockState$]),
        RxOp.map(([mimirRD, thorchainLastblockRD]) =>
          FP.pipe(
            sequenceTRD(mimirRD, thorchainLastblockRD),
            RD.map(([mimir, lastblockItems]) => {
              const lastHeight: number | undefined = FP.pipe(
                lastblockItems,
                A.findFirst(({ thorchain }) => thorchain > 0),
                O.map(({ thorchain }) => thorchain),
                O.toUndefined
              )

              const halt: MimirHalt = {
                // `HALT{chain}CHAIN` flags
                haltBnbChain: getMimirStatus(mimir.HALTBNBCHAIN, lastHeight),
                haltBchChain: getMimirStatus(mimir.HALTBCHCHAIN, lastHeight),
                haltBtcChain: getMimirStatus(mimir.HALTBTCCHAIN, lastHeight),
                haltEthChain: getMimirStatus(mimir.HALTETHCHAIN, lastHeight),
                haltLtcChain: getMimirStatus(mimir.HALTLTCCHAIN, lastHeight),
                haltThorChain: getMimirStatus(mimir.HALTTHORCHAIN, lastHeight),
                haltDogeChain: getMimirStatus(mimir.HALTDOGECHAIN, lastHeight),
                haltTerraChain: getMimirStatus(mimir.HALTTERRACHAIN, lastHeight),
                // `HALT{chain}TRADING` flags
                haltTrading: getMimirStatus(mimir.HALTTRADING, lastHeight),
                haltBnbTrading: getMimirStatus(mimir.HALTBNBTRADING, lastHeight),
                haltBchTrading: getMimirStatus(mimir.HALTBCHTRADING, lastHeight),
                haltBtcTrading: getMimirStatus(mimir.HALTBTCTRADING, lastHeight),
                haltEthTrading: getMimirStatus(mimir.HALTETHTRADING, lastHeight),
                haltLtcTrading: getMimirStatus(mimir.HALTLTCTRADING, lastHeight),
                haltDogeTrading: getMimirStatus(mimir.HALTDOGETRADING, lastHeight),
                haltTerraTrading: getMimirStatus(mimir.HALTTERRATRADING, lastHeight),
                // `PAUSELP{chain}` flags
                pauseLp: getMimirStatus(mimir.PAUSELP, lastHeight),
                pauseLpBnb: getMimirStatus(mimir.PAUSELPBNB, lastHeight),
                pauseLpBch: getMimirStatus(mimir.PAUSELPBCH, lastHeight),
                pauseLpBtc: getMimirStatus(mimir.PAUSELPBTC, lastHeight),
                pauseLpEth: getMimirStatus(mimir.PAUSELPETH, lastHeight),
                pauseLpLtc: getMimirStatus(mimir.PAUSELPLTC, lastHeight),
                pauseLpDoge: getMimirStatus(mimir.PAUSELPDOGE, lastHeight),
                pauseLpTerra: getMimirStatus(mimir.PAUSELPTERRA, lastHeight)
              }

              return halt
            })
          )
        ),
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
