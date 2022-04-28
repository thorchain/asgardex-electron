import { useMemo } from 'react'

import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { PageTitle } from '../../../components/page'
import { Tabs } from '../../../components/tabs'
import * as walletRoutes from '../../../routes/wallet'
import * as Styled from './CreateView.styles'
import { PhraseView } from './PhraseView'

enum TabKey {
  PHRASE = 'phrase',
  KEYSTORE = 'keystore'
}

export const CreateView = () => {
  const intl = useIntl()
  const navigate = useNavigate()

  const items = useMemo(
    () => [
      {
        key: TabKey.PHRASE,
        label: (
          <span onClick={() => navigate(walletRoutes.create.phrase.path())}>
            {intl.formatMessage({ id: 'common.phrase' })}
          </span>
        ),
        content: <PhraseView />
      }
    ],
    [navigate, intl]
  )

  return (
    <Styled.Container>
      <PageTitle>{intl.formatMessage({ id: 'wallet.create.title' })}</PageTitle>
      <Tabs tabs={items} defaultTabIndex={0} />
    </Styled.Container>
  )
}
