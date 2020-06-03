import React from 'react'

import { formatBN } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'

import Label from '../label'
import Status from '../status'
import { PoolShareWrapper } from './PoolShare.style'

type Props = {
  source: string
  target: string
  runeStakedShare?: string
  runeStakedPrice?: string
  loading?: boolean
  basePriceAsset?: string
  assetStakedShare?: string
  assetStakedPrice?: string
  assetEarnedAmount?: string
  assetEarnedPrice?: string
  runeEarnedAmount?: string
  runeEarnedPrice?: string
  poolShare: BigNumber
}

const PoolShare: React.FC<Props> = (props: Props): JSX.Element => {
  const {
    source,
    runeStakedShare,
    runeStakedPrice,
    loading,
    basePriceAsset,
    target,
    assetStakedShare,
    assetStakedPrice,
    assetEarnedAmount,
    assetEarnedPrice,
    runeEarnedAmount,
    runeEarnedPrice,
    poolShare
  } = props
  return (
    <PoolShareWrapper>
      <div className="your-share-wrapper">
        <Label className="share-info-title" size="normal">
          Your total share of the pool
        </Label>
        <div className="your-share-info-wrapper">
          <div className="share-info-row">
            <div className="your-share-info">
              <Status title={source.toUpperCase()} value={runeStakedShare} loading={loading} />
              <Label className="your-share-price-label" size="normal" color="gray" loading={loading}>
                {`${basePriceAsset} ${runeStakedPrice}`}
              </Label>
            </div>
            <div className="your-share-info">
              <Status title={target.toUpperCase()} value={assetStakedShare} loading={loading} />

              <Label className="your-share-price-label" size="normal" color="gray" loading={loading}>
                {`${basePriceAsset} ${assetStakedPrice}`}
              </Label>
            </div>
          </div>
          <div className="share-info-row">
            <div className="your-share-info pool-share-info">
              <Status title="Pool Share" value={poolShare ? `${formatBN(poolShare)}%` : '...'} loading={loading} />
            </div>
          </div>
        </div>
        <div className="your-share-wrapper">
          <Label className="share-info-title" size="normal">
            Your total earnings from the pool
          </Label>
          <div className="your-share-info-wrapper">
            <div className="share-info-row">
              <div className="your-share-info">
                <Status title={source.toUpperCase()} value={runeEarnedAmount} loading={loading} />
                <Label className="your-share-price-label" size="normal" color="gray" loading={loading}>
                  {basePriceAsset} {runeEarnedPrice}
                </Label>
              </div>
              <div className="your-share-info">
                <Status title={target.toUpperCase()} value={assetEarnedAmount} loading={loading} />
                <Label className="your-share-price-label" size="normal" color="gray" loading={loading}>
                  {basePriceAsset} {assetEarnedPrice}
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PoolShareWrapper>
  )
}

export default PoolShare
