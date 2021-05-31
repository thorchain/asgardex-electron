import React, { useCallback, useMemo } from 'react'

import { AssetAmount, formatAssetAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import { abbreviateNumber } from '../../helpers/numberHelper'
import { PoolDetail, PoolStatsDetail } from '../../types/generated/midgard/models'
import { PoolStatus } from '../uielements/poolStatus'
import * as Styled from './PoolCards.style'
import * as H from './PoolDetails.helpers'

export type Props = {
  poolDetail: PoolDetail
  poolStatsDetail: PoolStatsDetail
  priceSymbol?: string
  isLoading?: boolean
  priceRatio: BigNumber
}

export const PoolCards: React.FC<Props> = ({
  poolStatsDetail,
  priceSymbol = '',
  poolDetail,
  priceRatio,
  isLoading
}) => {
  const intl = useIntl()

  const liquidity = useMemo(() => H.getLiquidity(poolDetail, priceRatio), [poolDetail, priceRatio])
  const volume24 = useMemo(() => H.getVolume24(poolDetail, priceRatio), [poolDetail, priceRatio])
  const volumeTotal = useMemo(() => H.getVolumeTotal(poolStatsDetail, priceRatio), [poolStatsDetail, priceRatio])
  const apy = useMemo(() => H.getAPY(poolDetail), [poolDetail])

  const fees = useMemo(() => H.getFees(poolStatsDetail, priceRatio), [poolStatsDetail, priceRatio])
  const totalTx = useMemo(() => H.getTotalTx(poolStatsDetail), [poolStatsDetail])
  const members = useMemo(() => H.getMembers(poolStatsDetail), [poolStatsDetail])

  const ilpPaid = useMemo(() => H.getILPPaid(poolStatsDetail, priceRatio), [poolStatsDetail, priceRatio])

  const getFullValue = useCallback(
    (amount: AssetAmount): string => `${priceSymbol} ${formatAssetAmount({ amount: amount, trimZeros: true })}`,
    [priceSymbol]
  )

  return (
    <Styled.Container>
      <Styled.Col>
        <PoolStatus
          isLoading={isLoading}
          fullValue={getFullValue(liquidity)}
          label={intl.formatMessage({ id: 'common.liquidity' })}
          displayValue={`${priceSymbol} ${abbreviateNumber(liquidity.amount().toNumber(), 2)}`}
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
          fullValue={getFullValue(volumeTotal)}
          label={intl.formatMessage({ id: 'deposit.poolDetails.volumeTotal' })}
          displayValue={`${priceSymbol} ${abbreviateNumber(volumeTotal.amount().toNumber(), 2)}`}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          isLoading={isLoading}
          fullValue={getFullValue(volume24)}
          label={intl.formatMessage({ id: 'common.volume24' })}
          displayValue={`${priceSymbol} ${abbreviateNumber(volume24.amount().toNumber(), 2)}`}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          isLoading={isLoading}
          fullValue={getFullValue(fees)}
          label={intl.formatMessage({ id: 'deposit.poolDetails.totalFees' })}
          displayValue={`${priceSymbol} ${abbreviateNumber(fees.amount().toNumber(), 2)}`}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          isLoading={isLoading}
          label={intl.formatMessage({ id: 'deposit.poolDetails.totalTx' })}
          displayValue={abbreviateNumber(totalTx.toNumber(), 3)}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          isLoading={isLoading}
          label={intl.formatMessage({ id: 'deposit.poolDetails.apy' })}
          displayValue={`${abbreviateNumber(apy.toNumber(), 2)} %`}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          isLoading={isLoading}
          fullValue={getFullValue(ilpPaid)}
          label={intl.formatMessage({ id: 'deposit.poolDetails.ilpPaid' })}
          displayValue={`${priceSymbol} ${abbreviateNumber(ilpPaid.amount().toNumber(), 2)}`}
        />
      </Styled.Col>
    </Styled.Container>
  )
}
