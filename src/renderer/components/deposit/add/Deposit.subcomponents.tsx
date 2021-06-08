import React, { useState } from 'react'

import { assetToString, baseToAsset, formatAssetAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { AssetWithAmount } from '../../../types/asgardex'
import { Button } from '../../uielements/button'
import * as Styled from './Deposit.style'

type AssetIconAmountProps = {
  assetWB: AssetWithAmount
  network: Network
  loading: boolean
}

const AssetIconAmount: React.FC<AssetIconAmountProps> = (props): JSX.Element => {
  const {
    assetWB: { asset, amount },
    network,
    loading
  } = props
  return (
    <Styled.PendingAssetContainer>
      <Styled.PendingAssetIcon asset={asset} network={network} />
      <Styled.PendingAssetLabel asset={asset} />
      <Styled.PendingAssetAmountLabel loading={loading}>
        {formatAssetAmount({
          amount: baseToAsset(amount),
          decimal: amount.decimal,
          trimZeros: true
        })}
      </Styled.PendingAssetAmountLabel>
    </Styled.PendingAssetContainer>
  )
}

type PendingAssetsProps = {
  network: Network
  assets: AssetWithAmount[]
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
                assetWB={assetWB}
                loading={loading}
                key={`${assetToString(assetWB.asset)}-${index}`}
              />
            ))}
            <Styled.RecoveryDescription>
              {intl.formatMessage({ id: 'deposit.add.pendingAssets.recoveryDescription' })}
            </Styled.RecoveryDescription>
            <Button onClick={onClickRecovery} typevalue="outline" color="warning">
              {intl.formatMessage({ id: 'deposit.add.pendingAssets.recoveryTitle' })}
              <Styled.OpenRecoveryToolIcon />
            </Button>
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
