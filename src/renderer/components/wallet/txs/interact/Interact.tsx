import React from 'react'

import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { isLedgerWallet } from '../../../../../shared/utils/guard'
import { WalletType } from '../../../../../shared/wallet/types'
import * as Styled from './Interact.styles'
import { InteractType } from './Interact.types'

const TABS: InteractType[] = ['bond', 'unbond', 'leave', 'custom']

type Props = {
  interactType: InteractType
  interactTypeChanged: (type: InteractType) => void
  walletType: WalletType
  network: Network
}

export const Interact: React.FC<Props> = ({ interactType, interactTypeChanged, network, walletType, children }) => {
  const intl = useIntl()

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
              {TABS.map((type) => (
                <Styled.TabButton key={type} onClick={() => interactTypeChanged(type)}>
                  <Styled.TabLabel isActive={type === interactType}>
                    {intl.formatMessage({ id: `deposit.interact.actions.${type}` })}
                  </Styled.TabLabel>
                </Styled.TabButton>
              ))}
            </Styled.TabButtonsContainer>
          )}>
          {TABS.map((tab) => (
            <Styled.TabPane key={tab}>{children}</Styled.TabPane>
          ))}
        </Styled.Tabs>
      </Styled.FormWrapper>
    </Styled.Container>
  )
}
