import React, { useState } from 'react'

import { Asset, assetToString } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import { FormattedMessage, useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { ASYM_DEPOSIT_TOOL_URL } from '../../../const'
import { AssetData } from '../../uielements/assets/assetData'
import * as Styled from './Deposit.styles'

export type AsymAssetsWarningProps = {
  network: Network
  assets: Asset[]
  loading: boolean
  onClickOpenAsymTool: FP.Lazy<void>
}

export const AsymAssetsWarning: React.FC<AsymAssetsWarningProps> = (props): JSX.Element => {
  const { assets, network, onClickOpenAsymTool } = props

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
            {intl.formatMessage({ id: 'deposit.add.asymAssets.description' })}
          </Styled.AssetWarningDescription>
          {assets.map((asset) => (
            <AssetData asset={asset} network={network} key={`${assetToString(asset)}`} />
          ))}
          <Styled.AssetWarningDescription>
            <FormattedMessage
              id="deposit.add.asymAssets.recoveryDescription"
              values={{
                url: (
                  <Styled.AssetWarningDescriptionLink onClick={onClickOpenAsymTool}>
                    {ASYM_DEPOSIT_TOOL_URL[network]}
                  </Styled.AssetWarningDescriptionLink>
                )
              }}
            />
          </Styled.AssetWarningDescription>
          <Styled.WarningOpenExternalUrlButton onClick={onClickOpenAsymTool}>
            {intl.formatMessage({ id: 'deposit.add.asymAssets.recoveryTitle' })}
            <Styled.AssetWarningOpenExternalUrlIcon />
          </Styled.WarningOpenExternalUrlButton>
        </>
      )}
    </>
  )

  return (
    <Styled.Alert
      type="warning"
      message={intl.formatMessage({ id: 'deposit.add.asymAssets.title' })}
      description={subContent}
    />
  )
}
