import React from 'react'

import { AssetAmount, formatAssetAmountCurrency } from '@thorchain/asgardex-util'
import { useIntl } from 'react-intl'

import PoolStatus from '../../uielements/poolStatus'
import * as Styled from './PoolDetails.style'

type Props = {
  asset: string
  depth: AssetAmount
  volume24hr: AssetAmount
  allTimeVolume: AssetAmount
  totalSwaps: number
  totalStakers: number
  // decimal value in percents
  returnToDate: number
}

export const PoolDetails: React.FC<Props> = ({
  asset,
  depth,
  volume24hr,
  allTimeVolume,
  totalStakers,
  totalSwaps,
  returnToDate
}) => {
  const intl = useIntl()

  return (
    <Styled.Container>
      <Styled.Col>
        <PoolStatus asset={'rune'} label={intl.formatMessage({ id: 'stake.poolDetails.depth' })} target={asset}>
          {formatAssetAmountCurrency(depth)}
        </PoolStatus>
      </Styled.Col>

      <Styled.Col>
        <PoolStatus asset={'rune'} label={intl.formatMessage({ id: 'stake.poolDetails.24hvol' })} target={asset}>
          {formatAssetAmountCurrency(volume24hr)}
        </PoolStatus>
      </Styled.Col>

      <Styled.Col>
        <PoolStatus asset={'rune'} label={intl.formatMessage({ id: 'stake.poolDetails.allTimeVal' })} target={asset}>
          {formatAssetAmountCurrency(allTimeVolume)}
        </PoolStatus>
      </Styled.Col>

      <Styled.Col>
        <PoolStatus asset={'rune'} label={intl.formatMessage({ id: 'stake.poolDetails.totalSwaps' })} target={asset}>
          {totalSwaps}
        </PoolStatus>
      </Styled.Col>

      <Styled.Col>
        <PoolStatus asset={'rune'} label={intl.formatMessage({ id: 'stake.poolDetails.totalStakers' })} target={asset}>
          {totalStakers}
        </PoolStatus>
      </Styled.Col>

      <Styled.Col>
        <PoolStatus asset={'rune'} label={intl.formatMessage({ id: 'stake.poolDetails.returnToDate' })} target={asset}>
          {returnToDate + '%'}
        </PoolStatus>
      </Styled.Col>
    </Styled.Container>
  )
}
