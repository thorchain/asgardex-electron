import React, { useMemo } from 'react'

import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { isLedgerWallet } from '../../../../../shared/utils/guard'
import { WalletType } from '../../../../../shared/wallet/types'
import * as Styled from './Interact.styles'
import { InteractType } from './Interact.types'

type Tab = {
  key: InteractType
  label: string
}

type Tabs = Tab[]

type Props = {
  interactType: InteractType
  interactTypeChanged: (type: InteractType) => void
  walletType: WalletType
  network: Network
}

export const Interact: React.FC<Props> = ({ interactType, interactTypeChanged, network, walletType, children }) => {
  const intl = useIntl()

  const tabs: Tabs = useMemo(
    () => [
      {
        key: 'bond',
        label: intl.formatMessage({ id: 'deposit.interact.actions.bond' })
      },
      {
        key: 'unbond',
        label: intl.formatMessage({ id: 'deposit.interact.actions.unbond' })
      },
      {
        key: 'leave',
        label: intl.formatMessage({ id: 'deposit.interact.actions.leave' })
      },
      {
        key: 'custom',
        label: intl.formatMessage({ id: 'deposit.interact.actions.custom' })
      }
    ],
    [intl]
  )

  return (
    <Styled.Container>
      <Styled.Header>
        <Styled.AssetIcon network={network} />
        <div>
          <Styled.HeaderTitleWrapper>
            <Styled.HeaderTitle>{intl.formatMessage({ id: 'deposit.interact.title' })}</Styled.HeaderTitle>
            {isLedgerWallet(walletType) && (
              <Styled.WalletTypeLabel>{intl.formatMessage({ id: 'ledger.title' })}</Styled.WalletTypeLabel>
            )}
          </Styled.HeaderTitleWrapper>
          <Styled.HeaderSubtitle>{intl.formatMessage({ id: 'deposit.interact.subtitle' })}</Styled.HeaderSubtitle>
        </div>
      </Styled.Header>
      <Styled.FormWrapper>
        <Styled.Tabs
          activeKey={interactType}
          renderTabBar={() => (
            <Styled.TabButtonsContainer>
              {tabs.map(({ key, label }) => (
                <Styled.TabButton key={key} onClick={() => interactTypeChanged(key)}>
                  <Styled.TabLabel isActive={key === interactType}>{label}</Styled.TabLabel>
                </Styled.TabButton>
              ))}
            </Styled.TabButtonsContainer>
          )}>
          {tabs.map((tab) => (
            <Styled.TabPane tab={tab.label} key={tab.key}>
              {children}
            </Styled.TabPane>
          ))}
        </Styled.Tabs>
      </Styled.FormWrapper>
    </Styled.Container>
  )
}
