import React from 'react'

import { formatBN, BaseAmount, Asset, formatBaseAsAssetAmount } from '@thorchain/asgardex-util'
import { Col } from 'antd'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import { PoolCard } from './PoolCard'
import * as Styled from './PoolShare.style'

type Props = {
  sourceAsset: Asset
  targetAsset: Asset
  runeStakedShare: BaseAmount
  runeStakedPrice: BaseAmount
  loading?: boolean
  basePriceSymbol: string
  assetStakedShare: BaseAmount
  assetStakedPrice: BaseAmount
  poolShare: BigNumber
  units: BaseAmount
}

const PoolShare: React.FC<Props> = (props): JSX.Element => {
  const {
    sourceAsset,
    runeStakedShare,
    runeStakedPrice,
    loading,
    basePriceSymbol,
    targetAsset,
    assetStakedShare,
    assetStakedPrice,
    poolShare,
    units
  } = props

  const intl = useIntl()

  return (
    <Styled.PoolShareWrapper>
      <PoolCard
        title={intl.formatMessage({ id: 'stake.totalShare' })}
        loading={loading}
        sourceAsset={sourceAsset}
        targetAsset={targetAsset}
        runeAmount={runeStakedShare}
        runePrice={runeStakedPrice}
        assetAmount={assetStakedShare}
        assetPrice={assetStakedPrice}
        gradient={2}
        basePriceSymbol={basePriceSymbol}>
        <>
          <Col span={12} sm={24}>
            <Styled.ShareHeadline loading={loading}>{intl.formatMessage({ id: 'stake.units' })}</Styled.ShareHeadline>
            <Styled.ShareLabel loading={loading}>{`${formatBaseAsAssetAmount({ amount: units })}`}</Styled.ShareLabel>
          </Col>
          <Col span={12} sm={24}>
            <Styled.ShareHeadline loading={loading}>
              {intl.formatMessage({ id: 'stake.poolShare' })}
            </Styled.ShareHeadline>
            <Styled.ShareLabel loading={loading}>{`${formatBN(poolShare)}%`}</Styled.ShareLabel>
          </Col>
        </>
      </PoolCard>
    </Styled.PoolShareWrapper>
  )
}

export default PoolShare
