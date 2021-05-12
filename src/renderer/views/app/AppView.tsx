import React, { useMemo, useRef } from 'react'

import { SyncOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import * as NEA from 'fp-ts/NonEmptyArray'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { Footer } from '../../components/footer'
import { Header } from '../../components/header'
import { Button } from '../../components/uielements/button'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { envOrDefault } from '../../helpers/envHelper'
import { rdAltOnPending } from '../../helpers/fpHelpers'
import { HaltedChainsRD } from '../../services/midgard/types'
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

  const haltedChains = useObservableState(haltedChains$, RD.initial)

  const prevHaltedChains = useRef<HaltedChainsRD>(RD.initial)

  const renderHaltedChainsWarning = useMemo(
    () =>
      FP.pipe(
        haltedChains,
        RD.map((chains) => {
          prevHaltedChains.current = RD.success(chains)
          return chains
        }),
        rdAltOnPending(() => prevHaltedChains.current),
        RD.toOption,
        O.chain(NEA.fromArray),
        O.map((chains) => (
          <Styled.Alert
            key={'halted warning'}
            type="warning"
            message={intl.formatMessage({ id: 'pools.halted.chain' }, { chain: chains.join(', ') })}
          />
        )),
        O.getOrElse(() => <></>)
      ),
    [haltedChains, intl]
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
          <ViewRoutes />
        </View>
        <Footer commitHash={envOrDefault($COMMIT_HASH, '')} isDev={$IS_DEV} />
      </Styled.AppLayout>
    </Styled.AppWrapper>
  )
}
