import React, { useMemo } from 'react'

import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { isLedgerWallet } from '../../../../../shared/utils/guard'
import { WalletType } from '../../../../../shared/wallet/types'
import * as Styled from './Interact.styles'
import { InteractType } from './Interact.types'

type Props = {
  interactType: InteractType
  interactTypeChanged: (type: InteractType) => void
  walletType: WalletType
  network: Network
}

export const Interact: React.FC<Props> = ({ interactType, interactTypeChanged, network, walletType, children }) => {
  const intl = useIntl()

  const tabs: Array<{ type: InteractType; label: string }> = useMemo(
    () => [
      { type: 'bond', label: intl.formatMessage({ id: 'deposit.interact.actions.bond' }) },
      { type: 'unbond', label: intl.formatMessage({ id: 'deposit.interact.actions.unbond' }) },
      { type: 'leave', label: intl.formatMessage({ id: 'deposit.interact.actions.leave' }) },
      { type: 'custom', label: intl.formatMessage({ id: 'common.custom' }) }
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
              {tabs.map(({ type, label }) => (
                <Styled.TabButton key={type} onClick={() => interactTypeChanged(type)}>
                  <Styled.TabLabel isActive={type === interactType}>{label}</Styled.TabLabel>
                </Styled.TabButton>
              ))}
            </Styled.TabButtonsContainer>
          )}>
          {tabs.map(({ type }) => (
            <Styled.TabPane key={type}>{children}</Styled.TabPane>
          ))}
        </Styled.Tabs>
      </Styled.FormWrapper>
    </Styled.Container>
  )
}
