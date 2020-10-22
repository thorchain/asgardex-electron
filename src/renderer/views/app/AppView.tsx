import React, { useMemo } from 'react'

import { SyncOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { Footer } from '../../components/footer'
import { Header } from '../../components/header/Header'
import { Button } from '../../components/uielements/button'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { envOrDefault } from '../../helpers/envHelper'
import { View } from '../View'
import { ViewRoutes } from '../ViewRoutes'
import * as Styled from './AppView.style'

export const AppView: React.FC = (): JSX.Element => {
  const intl = useIntl()

  const {
    service: { apiEndpoint$, reloadApiEndpoint }
  } = useMidgardContext()

  const apiEndpoint = useObservableState(apiEndpoint$, RD.initial)

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
      <Styled.ErrorAlert
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
        <Header />
        <View>
          {renderMidgardError}
          <ViewRoutes />
        </View>
        <Footer commitHash={envOrDefault($COMMIT_HASH, '')} isDev={$IS_DEV} />
      </Styled.AppLayout>
    </Styled.AppWrapper>
  )
}
