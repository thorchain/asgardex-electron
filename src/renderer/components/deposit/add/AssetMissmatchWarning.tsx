import React, { useState } from 'react'

import { assetToString } from '@xchainjs/xchain-util'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { AssetsWithAddress } from '../../../types/asgardex'
import * as CStyled from './AssetMissmatchWarning.styles'
import * as Styled from './Deposit.styles'

export type PendingAssetsProps = {
  network: Network
  assetsWA: AssetsWithAddress
}

export const AssetMissmatchWarning: React.FC<PendingAssetsProps> = (props): JSX.Element => {
  const { assetsWA, network } = props

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
      <>
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
                  key={`${assetToString(asset)}-${index}`}
                />
              ))}
            </div>
          </>
        )}
      </>
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
