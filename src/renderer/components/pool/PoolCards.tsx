import React from 'react'

import { AssetAmount, formatAssetAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import { abbreviateNumber } from '../../helpers/numberHelper'
import { PoolStatus } from '../uielements/poolStatus'
import * as Styled from './PoolCards.style'

export type Props = {
  liquidity: AssetAmount
  volumn: AssetAmount
  earnings: AssetAmount
  fees: AssetAmount
  totalTx: BigNumber
  totalSwaps: BigNumber
  members: BigNumber
  apy: BigNumber
  // decimal value in percents
  priceSymbol?: string
  isLoading?: boolean
}

export const PoolCards: React.FC<Props> = ({
  liquidity,
  volumn,
  earnings,
  fees,
  totalTx,
  totalSwaps,
  members,
  apy,
  priceSymbol = '',
  isLoading
}) => {
  const intl = useIntl()

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
          fullValue={`${priceSymbol} ${formatAssetAmount({ amount: volumn, trimZeros: true })}`}
          label={intl.formatMessage({ id: 'deposit.poolDetails.volume' })}
          displayValue={`${priceSymbol} ${abbreviateNumber(volumn.amount().toNumber(), 2)}`}
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
