import React, { useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { AssetAmount, formatAssetAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { ZERO_ASSET_AMOUNT, ZERO_BN } from '../../const'
import { sequenceTRD } from '../../helpers/fpHelpers'
import { abbreviateNumber } from '../../helpers/numberHelper'
import { PoolDetailRD, PoolStatsDetailRD } from '../../services/midgard/types'
import { ErrorView } from '../shared/error'
import { Button } from '../uielements/button'
import { PoolStatus } from '../uielements/poolStatus'
import * as Styled from './PoolCards.styles'
import * as H from './PoolDetails.helpers'

export type Props = {
  poolDetail: PoolDetailRD
  poolStatsDetail: PoolStatsDetailRD
  reloadData: FP.Lazy<void>
  priceSymbol: string
  priceRatio: BigNumber
}

export const PoolCards: React.FC<Props> = (props) => {
  const { poolStatsDetail: poolStatsDetailRD, priceSymbol, poolDetail: poolDetailRD, priceRatio, reloadData } = props
  const intl = useIntl()

  const getFullValue = useCallback(
    (amount: AssetAmount): string => `${priceSymbol} ${formatAssetAmount({ amount: amount, trimZeros: true })}`,
    [priceSymbol]
  )

  const renderCards = useCallback(
    ({
      isLoading,
      liquidity,
      volume24,
      volumeTotal,
      apy,
      fees,
      totalTx,
      members,
      ilpPaid
    }: {
      isLoading: boolean
      liquidity: AssetAmount
      volume24: AssetAmount
      volumeTotal: AssetAmount
      apy: BigNumber
      fees: AssetAmount
      totalTx: BigNumber
      members: BigNumber
      ilpPaid: AssetAmount
    }) => (
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
    ),
    [getFullValue, intl, priceSymbol]
  )

  return FP.pipe(
    sequenceTRD(poolDetailRD, poolStatsDetailRD),
    RD.fold(
      () =>
        renderCards({
          isLoading: true,
          liquidity: ZERO_ASSET_AMOUNT,
          volume24: ZERO_ASSET_AMOUNT,
          volumeTotal: ZERO_ASSET_AMOUNT,
          apy: ZERO_BN,
          fees: ZERO_ASSET_AMOUNT,
          totalTx: ZERO_BN,
          members: ZERO_BN,
          ilpPaid: ZERO_ASSET_AMOUNT
        }),
      () =>
        renderCards({
          isLoading: true,
          liquidity: ZERO_ASSET_AMOUNT,
          volume24: ZERO_ASSET_AMOUNT,
          volumeTotal: ZERO_ASSET_AMOUNT,
          apy: ZERO_BN,
          fees: ZERO_ASSET_AMOUNT,
          totalTx: ZERO_BN,
          members: ZERO_BN,
          ilpPaid: ZERO_ASSET_AMOUNT
        }),
      (error) => (
        <ErrorView
          title={intl.formatMessage({ id: 'common.error' })}
          subTitle={error?.message ?? error.toString()}
          extra={<Button onClick={reloadData}>{intl.formatMessage({ id: 'common.retry' })}</Button>}
        />
      ),
      ([poolDetail, poolStatsDetail]) =>
        renderCards({
          isLoading: false,
          liquidity: H.getLiquidity(poolDetail, priceRatio),
          volume24: H.getVolume24(poolDetail, priceRatio),
          volumeTotal: H.getVolumeTotal(poolStatsDetail, priceRatio),
          apy: H.getAPY(poolDetail),
          fees: H.getFees(poolStatsDetail, priceRatio),
          totalTx: H.getTotalTx(poolStatsDetail),
          ilpPaid: H.getILPPaid(poolStatsDetail, priceRatio),
          members: H.getMembers(poolStatsDetail)
        })
    )
  )
}
