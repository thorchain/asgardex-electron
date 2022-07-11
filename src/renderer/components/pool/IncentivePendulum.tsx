import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { AssetRuneNative, baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { IncentivePendulumRD } from '../../hooks/useIncentivePendulum'
import type { AlertIconColor } from '../uielements/alert/'
import { Tooltip } from '../uielements/common/Common.styles'
import * as Styled from './IncentivePendulum.styles'

export type Props = {
  incentivePendulum: IncentivePendulumRD
}

export const IncentivePendulum: React.FC<Props> = (props): JSX.Element => {
  const { incentivePendulum: incentivePendulumRD } = props

  const intl = useIntl()

  const loading = (
    <Styled.ContentWrapper>
      {intl.formatMessage({ id: 'pools.incentivependulum.info' }, { percentage: '...' })}
      <Styled.AlertIcon color="grey" />
    </Styled.ContentWrapper>
  )
  return FP.pipe(
    incentivePendulumRD,
    RD.fold(
      () => loading,
      () => loading,
      (_) => <>{intl.formatMessage({ id: 'pools.incentivependulum.error' })}</>,
      ({ incentivePendulum, incentivePendulumLight, totalPooledRuneAmount, totalActiveBondAmount }) => {
        // Transform `IncentivePendulumLight` -> `AlertIconColor`
        const getColor = (): AlertIconColor => {
          switch (incentivePendulumLight) {
            case 'green':
              return 'primary'
            case 'yellow':
              return 'warning'
            case 'red':
              return 'error'
            default:
              return 'grey'
          }
        }

        const tooltip = intl.formatMessage(
          { id: 'pools.incentivependulum.tooltip' },
          {
            pooled: formatAssetAmountCurrency({
              amount: baseToAsset(totalPooledRuneAmount),
              asset: AssetRuneNative,
              decimal: 0
            }),
            bonded: formatAssetAmountCurrency({
              amount: baseToAsset(totalActiveBondAmount),
              asset: AssetRuneNative,
              decimal: 0
            })
          }
        )

        return (
          <Tooltip title={tooltip}>
            <Styled.ContentWrapper>
              {intl.formatMessage({ id: 'pools.incentivependulum.info' }, { percentage: incentivePendulum })}
              <Styled.AlertIcon color={getColor()} />
            </Styled.ContentWrapper>
          </Tooltip>
        )
      }
    )
  )
}
