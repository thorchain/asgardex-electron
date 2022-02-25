import React, { useMemo, useState } from 'react'

import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { isLedgerWallet } from '../../../../../shared/utils/guard'
import { WalletType } from '../../../../../shared/wallet/types'
import * as Styled from './Interact.styles'

type Props = {
  walletType: WalletType
  network: Network
  bondContent: JSX.Element
  unbondContent: JSX.Element
  leaveContent: JSX.Element
  customContent: JSX.Element
}

export const Interact: React.FC<Props> = ({
  bondContent,
  unbondContent,
  leaveContent,
  customContent,
  network,
  walletType
}) => {
  const intl = useIntl()

  const tabs = useMemo(
    () => [
      {
        key: 'bond',
        label: (isActive: boolean) => (
          <Styled.TabLabel isActive={isActive}>
            {intl.formatMessage({ id: 'deposit.interact.actions.bond' })}
          </Styled.TabLabel>
        ),
        content: bondContent
      },
      {
        key: 'unbond',
        label: (isActive: boolean) => (
          <Styled.UnbondLabel isActive={isActive}>
            {intl.formatMessage({ id: 'deposit.interact.actions.unbond' })}
          </Styled.UnbondLabel>
        ),
        content: unbondContent
      },
      {
        key: 'leave',
        label: (isActive: boolean) => (
          <Styled.LeaveLabel isActive={isActive}>
            {intl.formatMessage({ id: 'deposit.interact.actions.leave' })}
          </Styled.LeaveLabel>
        ),
        content: leaveContent
      },
      {
        key: 'other',
        label: (isActive: boolean) => (
          <Styled.TabLabel isActive={isActive}>
            {intl.formatMessage({ id: 'deposit.interact.actions.custom' })}
          </Styled.TabLabel>
        ),
        content: customContent
      }
    ],
    [intl, bondContent, unbondContent, leaveContent, customContent]
  )

  const [activeTabKey, setActiveTabKey] = useState(tabs[0].key)

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
          activeKey={activeTabKey}
          renderTabBar={() => (
            <Styled.TabButtonsContainer>
              {tabs.map((tab) => (
                <Styled.TabButton key={tab.key} onClick={() => setActiveTabKey(tab.key)}>
                  {tab.label(tab.key === activeTabKey)}
                </Styled.TabButton>
              ))}
            </Styled.TabButtonsContainer>
          )}>
          {tabs.map((tab) => (
            <Styled.TabPane tab={tab.label} key={tab.key}>
              {tab.content}
            </Styled.TabPane>
          ))}
        </Styled.Tabs>
      </Styled.FormWrapper>
    </Styled.Container>
  )
}
