import React, { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { PageTitle } from '../../../components/page/PageTitle'
import { Tabs } from '../../../components/tabs'
import { ImportKeystore } from '../../../components/wallet/keystore'
import { ImportPhrase } from '../../../components/wallet/phrase/'
import { useWalletContext } from '../../../contexts/WalletContext'
import { useKeystoreClientStates } from '../../../hooks/useKeystoreClientStates'
import * as walletRoutes from '../../../routes/wallet'
import { generateKeystoreId } from '../../../services/wallet/util'
import * as Styled from './ImportsView.styles'

enum TabKey {
  PHRASE = 'phrase',
  KEYSTORE = 'keystore'
}

export const ImportsView: React.FC = (): JSX.Element => {
  const intl = useIntl()
  const navigate = useNavigate()

  const { keystoreService } = useWalletContext()
  const { importKeystore, loadKeystore$, addKeystoreWallet, importingKeystoreState$, resetImportingKeystoreState } =
    keystoreService
  const { clientStates } = useKeystoreClientStates()

  const importingKeystoreState = useObservableState(importingKeystoreState$, RD.initial)

  // Reset `ImportingKeystoreState` by entering the view
  useEffect(() => {
    resetImportingKeystoreState()
  }, [resetImportingKeystoreState])

  // Redirect after successfull import
  useEffect(() => {
    if (RD.isSuccess(importingKeystoreState)) {
      resetImportingKeystoreState()
      // redirect to wallets assets view
      navigate(walletRoutes.assets.path())
    }
  }, [navigate, importingKeystoreState, resetImportingKeystoreState])

  const walletId = useMemo(() => generateKeystoreId(), [])

  const items = useMemo(
    () => [
      {
        key: TabKey.KEYSTORE,
        label: intl.formatMessage({ id: 'common.keystore' }),
        content: (
          <ImportKeystore
            walletId={walletId}
            loadKeystore$={loadKeystore$}
            importKeystore={importKeystore}
            importingKeystoreState={importingKeystoreState}
            clientStates={clientStates}
          />
        )
      },
      {
        key: TabKey.PHRASE,
        label: intl.formatMessage({ id: 'common.phrase' }),
        content: <ImportPhrase walletId={walletId} clientStates={clientStates} addKeystore={addKeystoreWallet} />
      }
    ],
    [intl, walletId, loadKeystore$, importKeystore, importingKeystoreState, clientStates, addKeystoreWallet]
  )

  const tabsChangeHandler = useCallback(
    (key: string) => {
      if (key === TabKey.PHRASE) {
        navigate(walletRoutes.imports.phrase.path())
      } else if (key === TabKey.KEYSTORE) {
        navigate(walletRoutes.imports.keystore.path())
      } else {
        // nothing}
      }
    },
    [navigate]
  )

  return (
    <Styled.ImportsViewWrapper>
      <PageTitle>{intl.formatMessage({ id: 'wallet.imports.wallet' })}</PageTitle>
      <Tabs tabs={items} defaultActiveKey={TabKey.KEYSTORE} onChange={tabsChangeHandler} />
    </Styled.ImportsViewWrapper>
  )
}
