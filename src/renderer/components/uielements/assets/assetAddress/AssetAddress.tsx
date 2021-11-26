import React from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'

import { Network } from '../../../../../shared/api/types'
import { AssetIcon, Size } from '../assetIcon'
import * as Styled from './AssetAddress.styles'

export type Props = {
  asset: Asset
  address: Address
  network: Network
  size?: Size
  className?: string
}

export const AssetAddress: React.FC<Props> = (props): JSX.Element => {
  const { asset, address, network, size = 'normal', className } = props

  return (
    <Styled.Wrapper className={className}>
      <AssetIcon asset={asset} size={size} network={network} />
      <Styled.AddressWrapper>
        <Styled.AddressEllipsis
          className={`${className}-address`}
          address={address}
          iconSize={size}
          chain={asset.chain}
          network={network}
          enableCopy
        />
      </Styled.AddressWrapper>
    </Styled.Wrapper>
  )
}
