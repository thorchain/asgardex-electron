import React, { useMemo, useState } from 'react'

import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { isLedgerWallet } from '../../../../../shared/utils/guard'
import { WalletType } from '../../../../../shared/wallet/types'
import * as Styled from './Interact.styles'
import { InteractType } from './Interact.types'

type Tab = {
  key: InteractType
  label: (isActive: boolean) => JSX.Element
}

type Tabs = Tab[]

type Props = {
  interactType: InteractType
  walletType: WalletType
  network: Network
}

export const Interact: React.FC<Props> = ({ interactType, network, walletType, children }) => {
  const intl = useIntl()

  const tabs: Tabs = useMemo(
    () => [
      {
        key: 'bond',
        label: (isActive: boolean) => (
          <Styled.TabLabel isActive={isActive}>
            {intl.formatMessage({ id: 'deposit.interact.actions.bond' })}
          </Styled.TabLabel>
        )
      },
      {
        key: 'unbond',
        label: (isActive: boolean) => (
          <Styled.UnbondLabel isActive={isActive}>
            {intl.formatMessage({ id: 'deposit.interact.actions.unbond' })}
          </Styled.UnbondLabel>
        )
      },
      {
        key: 'leave',
        label: (isActive: boolean) => (
          <Styled.LeaveLabel isActive={isActive}>
            {intl.formatMessage({ id: 'deposit.interact.actions.leave' })}
          </Styled.LeaveLabel>
        )
      },
      {
        key: 'custom',
        label: (isActive: boolean) => (
          <Styled.TabLabel isActive={isActive}>
            {intl.formatMessage({ id: 'deposit.interact.actions.custom' })}
          </Styled.TabLabel>
        )
      }
    ],
    [intl]
  )

  const [selectedInteractiveType, setSelectedInteractiveType] = useState<InteractType>(interactType)

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
        <Styled.FormTitle>{intl.formatMessage({ id: 'deposit.interact.actions' })}</Styled.FormTitle>
        <Styled.Tabs
          activeKey={selectedInteractiveType}
          renderTabBar={() => (
            <Styled.TabButtonsContainer>
              {tabs.map((tab) => (
                <Styled.TabButton key={tab.key} onClick={() => setSelectedInteractiveType(tab.key)}>
                  {tab.label(tab.key === selectedInteractiveType)}
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
