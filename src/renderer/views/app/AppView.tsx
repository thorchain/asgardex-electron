import React, { useMemo, useRef } from 'react'

import { SyncOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { Footer } from '../../components/footer'
import { Header } from '../../components/header'
import { Button } from '../../components/uielements/button'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { isEthChain } from '../../helpers/chainHelper'
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
        O.map(({ chains, mimirHalt: { haltThorChain, haltTrading, haltEthChain, haltEthTrading } }) => {
          let msg = ''
          // 1. Check THORCHain status provided by `mimir`
          if (haltThorChain) {
            msg = 'THORChain is halted temporary for maintenance.'
          } else if (haltTrading) {
            msg = 'Trading for all pools is halted temporary for maintenance.'
          } else if (haltEthChain) {
            // 2. Check ETH status provided by `mimir`
            msg = `ETH chain is halted temporary for maintenance.`
          } else if (haltEthTrading) {
            msg = `Trading for ETH is halted temporary for maintenance.`
          }
          // Filter ETH chain out to avoid duplicated messages
          if (haltEthChain || haltEthTrading) chains = FP.pipe(chains, A.filter(FP.not(isEthChain)))
          // 3. Check other status based on `inbound_addresses`
          if (!haltThorChain && !haltTrading && chains.length) {
            msg = `${msg} ${intl.formatMessage({ id: 'pools.halted.chain' }, { chain: chains.join(', ') })}`
          }

          return msg ? <Styled.Alert key={'halted warning'} type="warning" message={msg} /> : <></>
        }),
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
        O.map(({ haltThorChain, haltEthChain }) => {
          let msg = ''
          if (haltThorChain) {
            msg = 'Upgrade for ETH.RUNE and BNB.RUNE are disabled temporary for maintenance'
          } else if (haltEthChain) {
            msg = 'Upgrade for ETH.RUNE is disabled temporary for maintenance'
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
