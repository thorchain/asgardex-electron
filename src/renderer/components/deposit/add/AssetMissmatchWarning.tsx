import React, { useState } from 'react'

import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { AssetsWithAddress } from '../../../types/asgardex'
import * as CStyled from './AssetMissmatchWarning.styles'
import * as Styled from './Deposit.styles'

export type Props = {
  network: Network
  assets: AssetsWithAddress
}

export const AssetMissmatchWarning: React.FC<Props> = (props): JSX.Element => {
  const { assets: assetsWA, network } = props

  const intl = useIntl()

  const [collapsed, setCollapsed] = useState(false)

  const subContent = (
    <>
      <Styled.AssetWarningInfoButton selected={collapsed} onClick={() => setCollapsed((v) => !v)}>
        <Styled.AssetWarningInfoButtonLabel>
          {intl.formatMessage({ id: 'common.informationMore' })}
        </Styled.AssetWarningInfoButtonLabel>
        <Styled.AssetWarningInfoButtonIcon selected={collapsed} />
      </Styled.AssetWarningInfoButton>
      {collapsed && (
        <>
          <Styled.AssetWarningDescription>
            {intl.formatMessage({ id: 'deposit.add.assetMissmatch.description' })}
          </Styled.AssetWarningDescription>
          <div>
            {assetsWA.map(({ asset, address }, index) => (
              <CStyled.AssetAddress
                network={network}
                asset={asset}
                size="small"
                address={address}
                key={`${address}-${index}`}
              />
            ))}
          </div>
        </>
      )}
    </>
  )

  return (
    <Styled.Alert
      type="warning"
      message={intl.formatMessage({ id: 'deposit.add.assetMissmatch.title' })}
      description={subContent}
    />
  )
}
