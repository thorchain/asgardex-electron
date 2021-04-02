import React, { useMemo } from 'react'

import { AssetAmount, baseAmount, baseToAsset, bn, bnOrZero, formatAssetAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import { abbreviateNumber } from '../../helpers/numberHelper'
import { PoolDetail } from '../../types/generated/midgard/models'
import { PoolStatus } from '../uielements/poolStatus'
import * as Styled from './PoolCards.style'

export type Props = {
  poolDetail: PoolDetail
  earnings: AssetAmount
  fees: AssetAmount
  totalTx: BigNumber
  totalSwaps: BigNumber
  members: BigNumber
  priceSymbol?: string
  isLoading?: boolean
  priceRatio: BigNumber
}

const getDepth = (data: Pick<PoolDetail, 'runeDepth'>, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(data.runeDepth).multipliedBy(priceRatio)))

const getVolume = (data: Pick<PoolDetail, 'volume24h'>, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(data.volume24h).multipliedBy(priceRatio)))

const getAPY = (data: Pick<PoolDetail, 'poolAPY'>) => bn(data.poolAPY).plus(1).multipliedBy(100)

export const PoolCards: React.FC<Props> = ({
  earnings,
  fees,
  totalTx,
  totalSwaps,
  members,
  priceSymbol = '',
  poolDetail,
  priceRatio,
  isLoading
}) => {
  const intl = useIntl()

  const liquidity = useMemo(() => getDepth(poolDetail, priceRatio), [poolDetail, priceRatio])
  const volume = useMemo(() => getVolume(poolDetail, priceRatio), [poolDetail, priceRatio])
  const apy = useMemo(() => getAPY(poolDetail), [poolDetail])

  return (
    <Styled.Container>
      <Styled.Col>
        <PoolStatus
          isLoading={isLoading}
          fullValue={`${priceSymbol} ${formatAssetAmount({ amount: liquidity, trimZeros: true })}`}
          label={intl.formatMessage({ id: 'common.liquidity' })}
          displayValue={`${priceSymbol} ${abbreviateNumber(liquidity.amount().toNumber(), 2)}`}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          isLoading={isLoading}
          fullValue={`${priceSymbol} ${formatAssetAmount({ amount: volume, trimZeros: true })}`}
          label={intl.formatMessage({ id: 'deposit.poolDetails.volume' })}
          displayValue={`${priceSymbol} ${abbreviateNumber(volume.amount().toNumber(), 2)}`}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          isLoading={isLoading}
          fullValue={`${priceSymbol} ${formatAssetAmount({ amount: earnings, trimZeros: true })}`}
          label={intl.formatMessage({ id: 'deposit.poolDetails.earnings' })}
          displayValue={`${priceSymbol} ${abbreviateNumber(earnings.amount().toNumber(), 2)}`}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          isLoading={isLoading}
          fullValue={`${priceSymbol} ${formatAssetAmount({ amount: fees, trimZeros: true })}`}
          label={intl.formatMessage({ id: 'common.fees' })}
          displayValue={`${priceSymbol} ${abbreviateNumber(fees.amount().toNumber(), 2)}`}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          isLoading={isLoading}
          label={intl.formatMessage({ id: 'deposit.poolDetails.totalTx' })}
          displayValue={abbreviateNumber(totalTx.toNumber())}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          isLoading={isLoading}
          label={intl.formatMessage({ id: 'deposit.poolDetails.totalSwaps' })}
          displayValue={abbreviateNumber(totalSwaps.toNumber())}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          isLoading={isLoading}
          label={intl.formatMessage({ id: 'deposit.poolDetails.members' })}
          displayValue={abbreviateNumber(members.toNumber())}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          isLoading={isLoading}
          label={intl.formatMessage({ id: 'deposit.poolDetails.apy' })}
          displayValue={`${abbreviateNumber(apy.toNumber())} %`}
        />
      </Styled.Col>
    </Styled.Container>
  )
}
