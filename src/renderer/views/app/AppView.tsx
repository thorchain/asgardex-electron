import React, { useMemo, useRef } from 'react'

import { SyncOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { BCHChain, BNBChain, BTCChain, Chain, ETHChain, LTCChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { Footer } from '../../components/footer'
import { Header } from '../../components/header'
import { Button } from '../../components/uielements/button'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { envOrDefault } from '../../helpers/envHelper'
import { rdAltOnPending } from '../../helpers/fpHelpers'
import { useMimirHalt } from '../../hooks/useMimirHalt'
import { DEFAULT_MIMIR_HALT } from '../../services/thorchain/const'
import { MimirHalt, MimirHaltRD } from '../../services/thorchain/types'
import { View } from '../View'
import { ViewRoutes } from '../ViewRoutes'
import { AppUpdateView } from './AppUpdateView'
import * as Styled from './AppView.style'

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
        RD.map(([chains, mimirHalt]) => {
          prevHaltedChains.current = chains
          prevMimirHalt.current = mimirHalt
          return { chains, mimirHalt }
        }),
        rdAltOnPending<Error, { chains: Chain[]; mimirHalt: MimirHalt }>(() =>
          RD.success({
            chains: prevHaltedChains.current,
            mimirHalt: prevMimirHalt.current
          })
        ),
        RD.toOption,
        O.map(
          ({
            chains,
            mimirHalt: {
              haltThorChain,
              haltTrading,
              haltEthTrading,
              haltBtcChain,
              haltEthChain,
              haltBchChain,
              haltLtcChain,
              haltBnbChain
            }
          }) => {
            let msg = ''
            msg = haltEthTrading ? 'Trading for ETH is halted temporarily.' : msg
            msg = haltTrading ? 'Trading for all pools is halted temporarily.' : msg
            msg = haltThorChain ? 'THORChain is halted temporarily.' : msg

            if (!haltThorChain && !haltTrading && chains.length) {
              const chainsHaltState = [
                {
                  name: BTCChain,
                  halted: haltBtcChain
                },
                {
                  name: ETHChain,
                  halted: haltEthChain
                },
                {
                  name: BCHChain,
                  halted: haltBchChain
                },
                {
                  name: LTCChain,
                  halted: haltLtcChain
                },
                {
                  name: BNBChain,
                  halted: haltBnbChain
                }
              ]
              const haltedChains = chainsHaltState.filter((chain) => chain.halted).map((chain) => chain.name)
              msg = `${msg} ${intl.formatMessage({ id: 'pools.halted.chain' }, { chain: haltedChains.join(', ') })}`
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
          let msg = ''
          if (haltThorChain || (haltEthChain && haltBnbChain)) {
            msg = 'Upgrade for ETH.RUNE and BNB.RUNE are disabled temporary for maintenance'
          } else if (haltEthChain) {
            msg = 'Upgrade for ETH.RUNE is disabled temporary for maintenance'
          } else if (haltBnbChain) {
            msg = 'Upgrade for BNB.RUNE is disabled temporary for maintenance'
          }
          return msg ? <Styled.Alert key={'upgrade_warning'} type="warning" message={msg} /> : <></>
        }),
        O.getOrElse(() => <></>)
      ),
    [mimirHaltRD]
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
        <Footer commitHash={envOrDefault($COMMIT_HASH, '')} isDev={$IS_DEV} />
      </Styled.AppLayout>
    </Styled.AppWrapper>
  )
}
