import React, { useMemo } from 'react'

import { Asset, assetAmount, AssetAmount, bn, bnOrZero } from '@xchainjs/xchain-util'
import * as A from 'antd'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/Option'

import { PoolDetail } from '../../types/generated/midgard/models'
import { PoolCards } from './PoolCards'
import { PoolChart } from './PoolChart'
import * as Styled from './PoolDetails.style'
import { PoolTitle } from './PoolTitle'

const getPrice = (data: Pick<PoolDetail, 'assetPrice'>, priceRatio: BigNumber = bn(1)) =>
  assetAmount(bnOrZero(data.assetPrice).multipliedBy(priceRatio))

export type Props = {
  asset: Asset
  poolDetail: PoolDetail
  priceRatio: BigNumber
  priceSymbol?: string
  earnings: AssetAmount
  fees: AssetAmount
  totalTx: BigNumber
  totalSwaps: BigNumber
  members: BigNumber
  isLoading?: boolean
  HistoryView: React.ComponentType<{ poolAsset: Asset }>
}

export const PoolDetails: React.FC<Props> = ({
  asset,
  priceSymbol = '',
  earnings,
  fees,
  totalTx,
  totalSwaps,
  members,
  priceRatio,
  poolDetail,
  isLoading,
  HistoryView
}) => {
  const price = useMemo(() => getPrice(poolDetail, priceRatio), [poolDetail, priceRatio])

  return (
    <Styled.Container>
      <Styled.TopContainer>
        <A.Col span={24}>
          <PoolTitle asset={O.some(asset)} price={price} priceSymbol={priceSymbol} isLoading={isLoading} />
        </A.Col>
        <A.Col xs={24} md={8}>
          <PoolCards
            priceRatio={priceRatio}
            poolDetail={poolDetail}
            earnings={earnings}
            fees={fees}
            totalTx={totalTx}
            totalSwaps={totalSwaps}
            members={members}
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
