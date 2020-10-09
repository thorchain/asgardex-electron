import React, { useMemo } from 'react'

import { Asset } from '@thorchain/asgardex-util'
import { useIntl } from 'react-intl'

import { AddWallet } from './AddWallet'
import * as Styled from './Stake.styles'

type Props = {
  asset: Asset
  ShareContent: React.ComponentType<{ asset: Asset }>
  TopContent: React.ComponentType
  AddStake: React.ComponentType<{ asset: Asset }>
  hasWallet?: boolean
}

export const Stake: React.FC<Props> = ({ ShareContent, TopContent, AddStake, hasWallet, asset }) => {
  const intl = useIntl()

  const tabs = useMemo(
    () => [
      { label: intl.formatMessage({ id: 'common.add' }), key: 'add', content: <AddStake asset={asset} /> },
      { label: intl.formatMessage({ id: 'stake.withdraw' }), key: 'withdraw', content: 'withdraw' }
    ],
    [intl, asset]
  )

  const extra = useMemo(
    () => (
      <Styled.AdvancedButton color="primary" typevalue="outline">
        {intl.formatMessage({ id: 'stake.advancedMode' })}
      </Styled.AdvancedButton>
    ),
    [intl]
  )

  return (
    <Styled.Container>
      <Styled.TopContainer>
        <TopContent />
      </Styled.TopContainer>
      <Styled.ContentContainer>
        {hasWallet ? (
          <>
            <Styled.TotalContainer>
              <ShareContent asset={asset} />
            </Styled.TotalContainer>
            <Styled.StakeContentContainer>
              <Styled.Tabs tabs={tabs} centered={false} tabBarExtraContent={extra} />
            </Styled.StakeContentContainer>
          </>
        ) : (
          <AddWallet />
        )}
      </Styled.ContentContainer>
    </Styled.Container>
  )
}
