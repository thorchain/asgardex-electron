import React, { useState } from 'react'

import { ArrowTopRightOnSquareIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { assetToString, baseToAsset, formatAssetAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import { FormattedMessage, useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { RECOVERY_TOOL_URL } from '../../../const'
import { AssetWithAmount1e8, AssetsWithAmount1e8 } from '../../../types/asgardex'
import { Alert } from '../../uielements/alert'
import { AssetIcon } from '../../uielements/assets/assetIcon'
import { AssetLabel } from '../../uielements/assets/assetLabel'
import { BorderButton, TextButton } from '../../uielements/button'
import { Label } from '../../uielements/label'

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
    <div className="my-10px flex h-[32px] items-center first:mr-10px last:m-0">
      <AssetIcon className="mr-5px" size="small" asset={asset} network={network} />
      <AssetLabel className="p-0" asset={asset} />
      <Label
        className="!md:text-[24px] !md:leading-[24px] !w-auto p-0 font-mainBold !text-[17px] !leading-[17px]"
        loading={loading}>
        {formatAssetAmount({
          amount: baseToAsset(amount1e8),
          trimZeros: true
        })}
      </Label>
    </div>
  )
}

export type PendingAssetsProps = {
  network: Network
  assets: AssetsWithAmount1e8
  loading: boolean
  onClickRecovery: FP.Lazy<void>
  className?: string
}

export const PendingAssetsWarning: React.FC<PendingAssetsProps> = (props): JSX.Element => {
  const { assets, network, loading, onClickRecovery, className = '' } = props

  const intl = useIntl()

  const [collapsed, setCollapsed] = useState(false)

  const Description: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => (
    <p className="p-0 pb-10px font-main text-[12px] uppercase leading-[17px]">{children}</p>
  )

  const subContent = (
    <>
      <TextButton
        size="normal"
        color="neutral"
        className="mr-10px whitespace-nowrap pl-0 !font-mainBold uppercase"
        onClick={() => setCollapsed((v) => !v)}>
        {intl.formatMessage({ id: 'common.informationMore' })}
        <ChevronRightIcon className={`text-turquoise ${collapsed ? 'rotate-90' : ''} ease h-[20px] w-[20px] `} />
      </TextButton>

      {collapsed && (
        <>
          <Description>{intl.formatMessage({ id: 'deposit.add.pendingAssets.description' })}</Description>
          {assets.map((assetWB, index) => (
            <AssetIconAmount
              network={network}
              assetWA={assetWB}
              loading={loading}
              key={`${assetToString(assetWB.asset)}-${index}`}
            />
          ))}
          <Description>
            <FormattedMessage
              id="deposit.add.pendingAssets.recoveryDescription"
              values={{
                url: (
                  <span
                    className="cursor-pointer uppercase text-inherit underline hover:text-turquoise"
                    onClick={onClickRecovery}>
                    {RECOVERY_TOOL_URL[network]}
                  </span>
                )
              }}
            />
          </Description>
          <BorderButton color="warning" className="my-10px" onClick={onClickRecovery}>
            {intl.formatMessage({ id: 'deposit.add.pendingAssets.recoveryTitle' })}
            <ArrowTopRightOnSquareIcon className="ml-5px h-20px w-20px text-inherit" />
          </BorderButton>
        </>
      )}
    </>
  )

  return (
    <Alert
      className={className}
      type="warning"
      message={intl.formatMessage({ id: 'deposit.add.pendingAssets.title' })}
      description={subContent}
    />
  )
}
