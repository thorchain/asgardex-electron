import React from 'react'

import { Asset, AssetAmount } from '@xchainjs/xchain-util'
import * as A from 'antd'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/Option'

import { PoolCards } from './PoolCards'
import { PoolChart } from './PoolChart'
import * as Styled from './PoolDetails.style'
import { PoolTitle } from './PoolTitle'

export type Props = {
  asset: Asset
  price: AssetAmount
  priceSymbol?: string
  liquidity: AssetAmount
  volumn: AssetAmount
  earnings: AssetAmount
  fees: AssetAmount
  totalTx: BigNumber
  totalSwaps: BigNumber
  members: BigNumber
  apy: BigNumber
  isLoading?: boolean
  HistoryView: React.ComponentType<{ poolAsset: Asset }>
}

export const PoolDetails: React.FC<Props> = ({
  asset,
  price,
  priceSymbol = '',
  liquidity,
  volumn,
  earnings,
  fees,
  totalTx,
  totalSwaps,
  members,
  apy,
  isLoading,
  HistoryView
}) => {
  return (
    <Styled.Container>
      <Styled.TopContainer>
        <A.Col span={24}>
          <PoolTitle asset={O.some(asset)} price={price} priceSymbol={priceSymbol} isLoading={isLoading} />
        </A.Col>
        <A.Col xs={24} md={8}>
          <PoolCards
            liquidity={liquidity}
            volumn={volumn}
            earnings={earnings}
            fees={fees}
            totalTx={totalTx}
            totalSwaps={totalSwaps}
            members={members}
            apy={apy}
            priceSymbol={priceSymbol}
            isLoading={isLoading}
          />
        </A.Col>
        <A.Col xs={24} md={16}>
          <PoolChart isLoading={isLoading} />
        </A.Col>
      </Styled.TopContainer>
      <A.Col span={24}>
        <HistoryView poolAsset={asset} />
      </A.Col>
    </Styled.Container>
  )
}
