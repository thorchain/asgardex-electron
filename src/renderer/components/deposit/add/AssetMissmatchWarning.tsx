import React, { useState } from 'react'

import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { AssetsWithAddress } from '../../../types/asgardex'
import { Alert } from '../../uielements/alert'
import { AssetAddress } from '../../uielements/assets/assetAddress'
import { TextButton } from '../../uielements/button'

export type Props = {
  network: Network
  assets: AssetsWithAddress
  className?: string
}

export const AssetMissmatchWarning: React.FC<Props> = (props): JSX.Element => {
  const { assets: assetsWA, network, className = '' } = props

  const intl = useIntl()

  const [collapsed, setCollapsed] = useState(false)

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
          <p className="p-0 pb-10px font-main text-[12px] uppercase leading-[17px]">
            {intl.formatMessage({ id: 'deposit.add.assetMissmatch.description' })}
          </p>
          <div>
            {assetsWA.map(({ asset, address }, index) => (
              <AssetAddress
                className="pt-10px first:pt-0"
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
    <Alert
      className={className}
      type="warning"
      message={intl.formatMessage({ id: 'deposit.add.assetMissmatch.title' })}
      description={subContent}
    />
  )
}
