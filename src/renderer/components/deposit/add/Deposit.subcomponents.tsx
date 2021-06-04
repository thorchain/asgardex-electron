import React, { useState } from 'react'

import { assetToString, baseToAsset, formatAssetAmount } from '@xchainjs/xchain-util'
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
    <Styled.AssetContainer>
      <Styled.AssetIcon asset={asset} network={network} />
      <Styled.AssetLabel asset={asset} />
      <Styled.AssetAmountLabel loading={loading}>
        {formatAssetAmount({
          amount: baseToAsset(amount),
          decimal: amount.decimal,
          trimZeros: true
        })}
      </Styled.AssetAmountLabel>
    </Styled.AssetContainer>
  )
}

type PendingAssetsProps = {
  network: Network
  assets: AssetWithAmount[]
  loading: boolean
}

export const PendingAssets: React.FC<PendingAssetsProps> = (props): JSX.Element => {
  const { assets, network, loading } = props

  const intl = useIntl()

  const [collapsed, setCollapsed] = useState(true)

  const subContent = (
    <>
      {assets.map((assetWB, index) => (
        <AssetIconAmount
          network={network}
          assetWB={assetWB}
          loading={loading}
          key={`${assetToString(assetWB.asset)}-${index}`}
        />
      ))}
      <Styled.RecoveryDescription onClick={() => setCollapsed((v) => !v)}>More information</Styled.RecoveryDescription>
      <>
        {collapsed ? (
          <></>
        ) : (
          <>
            <Styled.RecoveryDescription>
              {intl.formatMessage({ id: 'deposit.add.pendingAssets.description' })}
            </Styled.RecoveryDescription>
            <Styled.RecoveryDescription>
              {intl.formatMessage({ id: 'deposit.add.pendingAssets.recoveryDescription' })}
            </Styled.RecoveryDescription>
            <Button onClick={() => console.log('action')} typevalue="outline" color="warning">
              {intl.formatMessage({ id: 'deposit.add.pendingAssets.recoveryTitle' })}
              <Styled.OpenRecoveryToolIcon />
            </Button>
          </>
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
