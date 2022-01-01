import React, { useMemo, useRef } from 'react'

import { SyncOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { BCHChain, BNBChain, BTCChain, Chain, ETHChain, LTCChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { envOrDefault } from '../../../shared/utils/env'
import { Footer } from '../../components/footer'
import { Header } from '../../components/header'
import { Button } from '../../components/uielements/button'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { unionChains } from '../../helpers/fp/array'
import { rdAltOnPending } from '../../helpers/fpHelpers'
import { useMimirHalt } from '../../hooks/useMimirHalt'
import { DEFAULT_MIMIR_HALT } from '../../services/thorchain/const'
import { MimirHalt, MimirHaltRD } from '../../services/thorchain/types'
import { View } from '../View'
import { ViewRoutes } from '../ViewRoutes'
import { AppUpdateView } from './AppUpdateView'
import * as Styled from './AppView.styles'

type HaltedChainsState = {
  chain: Chain
  haltedChain: boolean
  haltedTrading: boolean
  pausedLP: boolean
}
export const AppView: React.FC = (): JSX.Element => {
  const intl = useIntl()

  const {
    service: {
      apiEndpoint$,
      reloadApiEndpoint,
      pools: { haltedChains$ }
    }
  } = useMidgardContext()

  const apiEndpoint = useObservableState(apiEndpoint$, RD.initial)

  const haltedChainsRD = useObservableState(haltedChains$, RD.initial)

  const prevHaltedChains = useRef<Chain[]>([])
  const prevMimirHalt = useRef<MimirHalt>(DEFAULT_MIMIR_HALT)

  const { mimirHaltRD } = useMimirHalt()

  const renderHaltedChainsWarning = useMemo(
    () =>
      FP.pipe(
        RD.combine(haltedChainsRD, mimirHaltRD),
        RD.map(([inboundHaltedChains, mimirHalt]) => {
          prevHaltedChains.current = inboundHaltedChains
          prevMimirHalt.current = mimirHalt
          return { inboundHaltedChains, mimirHalt }
        }),
        rdAltOnPending<Error, { inboundHaltedChains: Chain[]; mimirHalt: MimirHalt }>(() =>
          RD.success({
            inboundHaltedChains: prevHaltedChains.current,
            mimirHalt: prevMimirHalt.current
          })
        ),
        RD.toOption,
        O.map(
          ({
            inboundHaltedChains,
            mimirHalt: {
              haltThorChain,
              haltTrading,
              haltBnbChain,
              haltBnbTrading,
              pauseLp,
              pauseLpBnb,
              haltBtcChain,
              haltBtcTrading,
              pauseLpBtc,
              haltEthChain,
              haltEthTrading,
              pauseLpEth,
              haltBchChain,
              haltBchTrading,
              pauseLpBch,
              haltLtcChain,
              haltLtcTrading,
              pauseLpLtc
            }
          }) => {
            let msg = ''
            msg = haltTrading ? intl.formatMessage({ id: 'halt.trading' }) : msg
            msg = haltThorChain ? intl.formatMessage({ id: 'halt.thorchain' }) : msg

            if (!haltThorChain && !haltTrading) {
              const haltedChainsState: HaltedChainsState[] = [
                {
                  chain: BTCChain,
                  haltedChain: haltBtcChain,
                  haltedTrading: haltBtcTrading,
                  pausedLP: pauseLpBtc
                },
                {
                  chain: ETHChain,
                  haltedChain: haltEthChain,
                  haltedTrading: haltEthTrading,
                  pausedLP: pauseLpEth
                },
                {
                  chain: BCHChain,
                  haltedChain: haltBchChain,
                  haltedTrading: haltBchTrading,
                  pausedLP: pauseLpBch
                },
                {
                  chain: LTCChain,
                  haltedChain: haltLtcChain,
                  haltedTrading: haltLtcTrading,
                  pausedLP: pauseLpLtc
                },
                {
                  chain: BNBChain,
                  haltedChain: haltBnbChain,
                  haltedTrading: haltBnbTrading,
                  pausedLP: pauseLpBnb
                }
              ]

              const haltedChains = FP.pipe(
                haltedChainsState,
                A.filter(({ haltedChain }) => haltedChain),
                A.map(({ chain }) => chain),
                // merge chains of `inbound_addresses` and `mimir` endpoints
                // by  removing duplicates
                unionChains(inboundHaltedChains)
              )

              msg =
                haltedChains.length === 1
                  ? `${msg} ${intl.formatMessage({ id: 'halt.chain' }, { chain: haltedChains[0] })}`
                  : haltedChains.length > 1
                  ? `${msg} ${intl.formatMessage({ id: 'halt.chains' }, { chains: haltedChains.join(', ') })}`
                  : `${msg}`

              const haltedTradingChains = haltedChainsState
                .filter(({ haltedTrading }) => haltedTrading)
                .map(({ chain }) => chain)
              msg =
                haltedTradingChains.length > 0
                  ? `${msg} ${intl.formatMessage(
                      { id: 'halt.chain.trading' },
                      { chains: haltedTradingChains.join(', ') }
                    )}`
                  : `${msg}`

              const pausedLPs = haltedChainsState.filter(({ pausedLP }) => pausedLP).map(({ chain }) => chain)
              msg =
                pausedLPs.length > 0
                  ? `${msg} ${intl.formatMessage({ id: 'halt.chain.pause' }, { chains: pausedLPs.join(', ') })}`
                  : pauseLp
                  ? `${msg} ${intl.formatMessage({ id: 'halt.chain.pauseall' })}`
                  : `${msg}`
            }

            return msg ? <Styled.Alert key={'halted warning'} type="warning" message={msg} /> : <></>
          }
        ),
        O.getOrElse(() => <></>)
      ),
    [haltedChainsRD, intl, mimirHaltRD]
  )

  const prevMimirHaltRD = useRef<MimirHaltRD>(RD.initial)

  const renderUpgradeWarning = useMemo(
    () =>
      FP.pipe(
        mimirHaltRD,
        RD.map((mimirHalt) => {
          prevMimirHaltRD.current = RD.success(mimirHalt)
          return mimirHalt
        }),
        rdAltOnPending(() => prevMimirHaltRD.current),
        RD.toOption,
        O.map(({ haltThorChain, haltEthChain, haltBnbChain }) => {
          const mkMsg = (chains: string[]) =>
            intl.formatMessage({ id: 'halt.chain.upgrade' }, { chains: chains.join(', ') })
          const mkAlert = (msg: string) => <Styled.Alert key={'upgrade_warning'} type="warning" message={msg} />

          if (haltThorChain || (haltEthChain && haltBnbChain)) return FP.pipe(mkMsg(['ETH.RUNE', 'BNB.RUNE']), mkAlert)
          if (haltEthChain) return FP.pipe(mkMsg(['ETH.RUNE']), mkAlert)
          if (haltBnbChain) return FP.pipe(mkMsg(['BNB.RUNE']), mkAlert)

          return <></>
        }),
        O.getOrElse(() => <></>)
      ),
    [intl, mimirHaltRD]
  )

  const renderMidgardAlert = useMemo(() => {
    const description = (
      <>
        <Styled.ErrorDescription>
          {intl.formatMessage({ id: 'midgard.error.byzantine.description' })}
        </Styled.ErrorDescription>
        <Button onClick={reloadApiEndpoint} typevalue="outline" color="error">
          <SyncOutlined />
          {intl.formatMessage({ id: 'common.reload' })}
        </Button>
      </>
    )

    return (
      <Styled.Alert
        type="error"
        message={intl.formatMessage({ id: 'midgard.error.byzantine.title' })}
        description={description}
      />
    )
  }, [intl, reloadApiEndpoint])

  const renderMidgardError = useMemo(() => {
    const empty = () => <></>
    return FP.pipe(
      apiEndpoint,
      RD.fold(empty, empty, () => renderMidgardAlert, empty)
    )
  }, [apiEndpoint, renderMidgardAlert])

  return (
    <Styled.AppWrapper>
      <Styled.AppLayout>
        <AppUpdateView />
        <Header />

        <View>
          {renderMidgardError}
          {renderHaltedChainsWarning}
          {renderUpgradeWarning}
          <ViewRoutes />
        </View>
        <Footer commitHash={envOrDefault($COMMIT_HASH, '')} isDev={import.meta.env.DEV} />
      </Styled.AppLayout>
    </Styled.AppWrapper>
  )
}
