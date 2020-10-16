import React, { useMemo } from 'react'

import { useIntl } from 'react-intl'

import { PageTitle } from '../../../components/page/PageTitle'
import { Tabs } from '../../../components/tabs'
import { ImportPhrase } from '../../../components/wallet/phrase/'
import * as Styled from './ImportsView.style'

enum TabKey {
  PHRASE = 'phrase',
  KEYSTORE = 'keystore'
}

type Tab = {
  key: TabKey
  label: string
  content: React.ReactNode
}

export const ImportsView: React.FC = (): JSX.Element => {
  const intl = useIntl()
  const items: Tab[] = useMemo(
    () => [
      { key: TabKey.PHRASE, label: intl.formatMessage({ id: 'wallet.imports.phrase' }), content: <ImportPhrase /> }
    ],
    [intl]
  )

  return (
    <Styled.ImportsViewWrapper>
      <PageTitle>{intl.formatMessage({ id: 'wallet.imports.wallet' })}</PageTitle>
      <Tabs tabs={items} />
    </Styled.ImportsViewWrapper>
  )
}
