import React from 'react'

import { Asset } from '@xchainjs/xchain-util'

import { Network } from '../../../../../shared/api/types'
import { DownIcon } from '../../../icons'
import { AssetData } from '../assetData'

export type Props = {
  asset: Asset
  network: Network
}

export const AssetSelectButton: React.FC<Props> = (props): JSX.Element => {
  const { asset, network } = props

  return (
    <div className="flex cursor-pointer items-center">
      <AssetData asset={asset} network={network} />
      <div className="flex flex-row items-center border-none bg-transparent p-0 focus:outline-none">
        <div className="pt-5px">
          <DownIcon className="scale-125" />
        </div>
      </div>
    </div>
  )
}
