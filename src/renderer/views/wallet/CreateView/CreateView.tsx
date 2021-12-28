import React, { useEffect, useMemo, useState } from 'react'

import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

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
  const history = useHistory()

  const [activeTab, setActiveTab] = useState(TabKey.PHRASE)

  const items = useMemo(
    () => [
      /* Remove keystore option
      {
        key: TabKey.KEYSTORE,
        label: (
          <span onClick={() => history.push(walletRoutes.create.keystore.template)}>
            {intl.formatMessage({ id: 'common.keystore' })}
          </span>
        ),
        content: <KeystoreView />
      },
      */
      {
        key: TabKey.PHRASE,
        label: (
          <span onClick={() => history.push(walletRoutes.create.phrase.template)}>
            {intl.formatMessage({ id: 'common.phrase' })}
          </span>
        ),
        content: <PhraseView />
      }
    ],
    [history, intl]
  )

  /**
   * Need to initial sync tabs' state with history.
   * Call only for onMount
   */
  useEffect(() => {
    history.replace(walletRoutes.create.phrase.path())
  }, [history])

  /**
   * Need to sync tabs' state with history
   */
  useEffect(() => {
    return history.listen((location) => {
      if (location.pathname.includes(walletRoutes.create.keystore.template)) {
        setActiveTab(TabKey.KEYSTORE)
      } else if (location.pathname.includes(walletRoutes.create.phrase.template)) {
        setActiveTab(TabKey.PHRASE)
      }
    })
  }, [history, activeTab])

  return (
    <Styled.Container>
      <PageTitle>{intl.formatMessage({ id: 'wallet.create.title' })}</PageTitle>
      <Tabs tabs={items} defaultTabIndex={0} activeTabKey={activeTab} />
    </Styled.Container>
  )
}
