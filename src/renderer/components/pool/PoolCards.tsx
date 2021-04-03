import React, { useMemo } from 'react'

import { formatAssetAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { abbreviateNumber } from '../../helpers/numberHelper'
import { EarningsHistoryItemPool, PoolDetail, PoolStatsDetail } from '../../types/generated/midgard/models'
import { PoolStatus } from '../uielements/poolStatus'
import * as Styled from './PoolCards.style'
import * as H from './PoolDetails.helpers'

export type Props = {
  poolDetail: PoolDetail
  poolStatsDetail: PoolStatsDetail
  earningsHistory: O.Option<EarningsHistoryItemPool>
  priceSymbol?: string
  isLoading?: boolean
  priceRatio: BigNumber
}

export const PoolCards: React.FC<Props> = ({
  poolStatsDetail,
  priceSymbol = '',
  poolDetail,
  earningsHistory,
  priceRatio,
  isLoading
}) => {
  const intl = useIntl()

  const liquidity = useMemo(() => H.getDepth(poolDetail, priceRatio), [poolDetail, priceRatio])
  const volume = useMemo(() => H.getVolume(poolDetail, priceRatio), [poolDetail, priceRatio])
  const apy = useMemo(() => H.getAPY(poolDetail), [poolDetail])

  const fees = useMemo(() => H.getFees(poolStatsDetail, priceRatio), [poolStatsDetail, priceRatio])
  const totalTx = useMemo(() => H.getTotalTx(poolStatsDetail), [poolStatsDetail])
  const totalSwaps = useMemo(() => H.getTotalSwaps(poolStatsDetail), [poolStatsDetail])
  const members = useMemo(() => H.getMembers(poolStatsDetail), [poolStatsDetail])

  const earnings = useMemo(() => H.getEarnings(earningsHistory), [earningsHistory])

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
