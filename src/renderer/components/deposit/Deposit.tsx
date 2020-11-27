import React, { useMemo } from 'react'

import { Asset } from '@xchainjs/xchain-util'
import { useIntl } from 'react-intl'

import { KeystoreState } from '../../services/wallet/types'
import { hasImportedKeystore, isLocked } from '../../services/wallet/util'
import { DepositType } from '../../types/asgardex'
import { AddWallet } from '../wallet/add'
import * as Styled from './Deposit.styles'

type TabKey = 'deposit-sym' | 'deposit-asym' | 'withdraw'

type Tab = {
  key: TabKey
  label: string
  content: JSX.Element
}

type Props = {
  asset: Asset
  runeAsset: Asset
  ShareContent: React.ComponentType<{ asset: Asset; runeAsset: Asset }>
  DepositContent: React.ComponentType<{ asset: Asset; runeAsset: Asset; type: DepositType }>
  WidthdrawContent: React.ComponentType<{ depositAsset: Asset; runeAsset: Asset }>
  keystoreState: KeystoreState
}

export const Deposit: React.FC<Props> = (props) => {
  const { ShareContent, DepositContent, WidthdrawContent, runeAsset, asset, keystoreState } = props
  const intl = useIntl()

  const walletIsImported = useMemo(() => hasImportedKeystore(keystoreState), [keystoreState])
  const walletIsLocked = useMemo(() => isLocked(keystoreState), [keystoreState])

  const tabs = useMemo(
    (): Tab[] => [
      {
        key: 'deposit-asym',
        label: intl.formatMessage({ id: 'stake.add.asym' }, { asset: asset.ticker }),
        content: <DepositContent asset={asset} runeAsset={runeAsset} type="asym" />
      },
      {
        key: 'deposit-sym',
        label: intl.formatMessage({ id: 'stake.add.sym' }, { assetA: asset.ticker, assetB: runeAsset.ticker }),
        content: <DepositContent asset={asset} runeAsset={runeAsset} type="sym" />
      },
      {
        key: 'withdraw',
        label: intl.formatMessage({ id: 'stake.withdraw' }),
        content: <WidthdrawContent depositAsset={asset} runeAsset={runeAsset} />
      }
    ],
    [intl, asset, runeAsset, DepositContent, WidthdrawContent]
  )

  return (
    <Styled.Container>
      <Styled.ContentContainer>
        {walletIsImported && !walletIsLocked ? (
          <>
            <Styled.DepositContentCol xs={24} xl={15}>
              <Styled.Tabs destroyInactiveTabPane tabs={tabs} centered={false} defaultTabIndex={1} />
            </Styled.DepositContentCol>
            <Styled.ShareContentCol xs={24} xl={9}>
              <Styled.ShareContentWrapper>
                <ShareContent runeAsset={runeAsset} asset={asset} />
              </Styled.ShareContentWrapper>
            </Styled.ShareContentCol>
          </>
        ) : (
          <AddWallet isLocked={walletIsImported && walletIsLocked} />
        )}
      </Styled.ContentContainer>
    </Styled.Container>
  )
}
