import React, { useState } from 'react'

import { assetToString, baseToAsset, formatAssetAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import { FormattedMessage, useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { RECOVERY_TOOL_URL } from '../../../const'
import { AssetWithAmount1e8, AssetsWithAmount1e8 } from '../../../types/asgardex'
import * as Styled from './Deposit.styles'

type AssetIconAmountProps = {
  assetWA: AssetWithAmount1e8
  network: Network
  loading: boolean
}

const AssetIconAmount: React.FC<AssetIconAmountProps> = (props): JSX.Element => {
  const {
    assetWA: { asset, amount1e8 },
    network,
    loading
  } = props
  return (
    <Styled.PendingAssetContainer>
      <Styled.PendingAssetIcon asset={asset} network={network} />
      <Styled.PendingAssetLabel asset={asset} />
      <Styled.PendingAssetAmountLabel loading={loading}>
        {formatAssetAmount({
          amount: baseToAsset(amount1e8),
          trimZeros: true
        })}
      </Styled.PendingAssetAmountLabel>
    </Styled.PendingAssetContainer>
  )
}

type PendingAssetsProps = {
  network: Network
  assets: AssetsWithAmount1e8
  loading: boolean
  onClickRecovery: FP.Lazy<void>
}

export const PendingAssets: React.FC<PendingAssetsProps> = (props): JSX.Element => {
  const { assets, network, loading, onClickRecovery } = props

  const intl = useIntl()

  const [collapsed, setCollapsed] = useState(false)

  const subContent = (
    <>
      <Styled.RecoveryInfoButton selected={collapsed} onClick={() => setCollapsed((v) => !v)}>
        <Styled.RecoveryInfoButtonLabel>
          {intl.formatMessage({ id: 'common.informationMore' })}
        </Styled.RecoveryInfoButtonLabel>
        <Styled.RecoveryInfoButtonIcon selected={collapsed} />
      </Styled.RecoveryInfoButton>
      <>
        {collapsed ? (
          <>
            <Styled.RecoveryDescription>
              {intl.formatMessage({ id: 'deposit.add.pendingAssets.description' })}
            </Styled.RecoveryDescription>
            {assets.map((assetWB, index) => (
              <AssetIconAmount
                network={network}
                assetWA={assetWB}
                loading={loading}
                key={`${assetToString(assetWB.asset)}-${index}`}
              />
            ))}
            <Styled.RecoveryDescription>
              <FormattedMessage
                id="deposit.add.pendingAssets.recoveryDescription"
                values={{
                  url: (
                    <Styled.RecoveryDescriptionLink onClick={onClickRecovery}>
                      {RECOVERY_TOOL_URL[network]}
                    </Styled.RecoveryDescriptionLink>
                  )
                }}
              />
            </Styled.RecoveryDescription>
            <Styled.RecoveryOpenButton onClick={onClickRecovery}>
              {intl.formatMessage({ id: 'deposit.add.pendingAssets.recoveryTitle' })}
              <Styled.OpenRecoveryToolIcon />
            </Styled.RecoveryOpenButton>
          </>
        ) : (
          <></>
        )}
      </>
    </>
  )

  return (
    <Styled.Alert
      type="warning"
      message={intl.formatMessage({ id: 'deposit.add.pendingAssets.title' })}
      description={subContent}
    />
  )
}
