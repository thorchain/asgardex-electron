import React, { useEffect, useMemo, useRef } from 'react'

import { SyncOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { BCHChain, BNBChain, BTCChain, Chain, CosmosChain, ETHChain, LTCChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { DEFAULT_LOCALE } from '../../../shared/i18n/const'
import { envOrDefault } from '../../../shared/utils/env'
import { Footer } from '../../components/footer'
import { Header } from '../../components/header'
import { BorderButton } from '../../components/uielements/button'
import { useI18nContext } from '../../contexts/I18nContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { unionChains } from '../../helpers/fp/array'
import { rdAltOnPending } from '../../helpers/fpHelpers'
import { useKeystoreLedgers } from '../../hooks/useKeystoreLedgers'
import { useKeystoreWallets } from '../../hooks/useKeystoreWallets'
import { useMimirHalt } from '../../hooks/useMimirHalt'
import { useTheme } from '../../hooks/useTheme'
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

  const { locale$ } = useI18nContext()
  const currentLocale = useObservableState(locale$, DEFAULT_LOCALE)

  const { isLight } = useTheme()

  // locale
  useEffect(() => {
    // Needed to update Electron native menu according to the selected locale
    window.apiLang.update(currentLocale)
  }, [currentLocale])

  // Add/remove `dark` selector depending on selected theme (needed for tailwind)
  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }, [isLight])

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

  const { walletsPersistentRD, reload: reloadPersistentWallets } = useKeystoreWallets()
  const { ledgerAddressesPersistentRD, reloadPersistentLedgerAddresses } = useKeystoreLedgers()

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
              pauseLpLtc,
              haltCosmosChain,
              haltCosmosTrading,
              pauseLpCosmos
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
                },
                {
                  chain: CosmosChain,
                  haltedChain: haltCosmosChain,
                  haltedTrading: haltCosmosTrading,
                  pausedLP: pauseLpCosmos
                }
              ]

              const haltedChains = FP.pipe(
                haltedChainsState,
                A.filter(({ haltedChain }) => haltedChain),
                A.map(({ chain }) => chain),
                // merge chains of `inbound_addresses` and `mimir` endpoints
                // by removing duplicates
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

  const renderMidgardError = useMemo(() => {
    const empty = () => <></>
    return FP.pipe(
      apiEndpoint,
      RD.fold(
        empty,
        empty,
        (e) => (
          <Styled.Alert
            type="error"
            message={intl.formatMessage({ id: 'midgard.error.endpoint.title' })}
            description={e?.message ?? e.toString()}
            action={
              <BorderButton onClick={reloadApiEndpoint} color="error" size="medium">
                <SyncOutlined className="mr-10px" />
                {intl.formatMessage({ id: 'common.reload' })}
              </BorderButton>
            }
          />
        ),
        empty
      )
    )
  }, [apiEndpoint, intl, reloadApiEndpoint])

  const renderKeystoreError = useMemo(() => {
    const empty = () => <></>
    return FP.pipe(
      walletsPersistentRD,
      RD.fold(
        empty,
        empty,
        (e) => (
          <Styled.Alert
            type="warning"
            message={intl.formatMessage({ id: 'wallet.imports.error.keystore.import' })}
            description={e?.message ?? e.toString()}
            action={
              <BorderButton color="warning" size="medium" onClick={reloadPersistentWallets}>
                {intl.formatMessage({ id: 'common.retry' })}
              </BorderButton>
            }
          />
        ),
        empty
      )
    )
  }, [walletsPersistentRD, reloadPersistentWallets, intl])

  const renderKeystoreLedgerError = useMemo(() => {
    const empty = () => <></>
    return FP.pipe(
      ledgerAddressesPersistentRD,
      RD.fold(
        empty,
        empty,
        (e) => (
          <Styled.Alert
            type="warning"
            message={intl.formatMessage({ id: 'wallet.imports.error.ledger.import' })}
            description={e?.message ?? e.toString()}
            action={
              <BorderButton color="warning" size="medium" onClick={reloadPersistentLedgerAddresses}>
                {intl.formatMessage({ id: 'common.retry' })}
              </BorderButton>
            }
          />
        ),
        empty
      )
    )
  }, [ledgerAddressesPersistentRD, reloadPersistentLedgerAddresses, intl])

  return (
    <Styled.AppWrapper>
      <Styled.AppLayout>
        <AppUpdateView />
        <Header />

        <View>
          {renderMidgardError}
          {renderKeystoreError}
          {renderKeystoreLedgerError}
          {renderHaltedChainsWarning}
          {renderUpgradeWarning}
          <ViewRoutes />
        </View>
        <Footer commitHash={envOrDefault($COMMIT_HASH, '')} isDev={$IS_DEV} />
      </Styled.AppLayout>
    </Styled.AppWrapper>
  )
}
