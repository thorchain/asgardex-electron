import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { isUSDAsset } from '../../../helpers/assetHelper'
import { BaseAmountRD } from '../../../types'
import { PricePool } from '../../../views/pools/Pools.types'
import { Spin } from '../../shared/loading'
import * as Styled from './AssetsTotalBalances.styles'

type Props = {
  pricePool: PricePool
  total: BaseAmountRD
}

export const AssetsTotalBalances: React.FC<Props> = (props): JSX.Element => {
  const { pricePool, total: totalRD } = props

  const intl = useIntl()

  const renderTotal = useMemo(
    () => (
      <Styled.BalanceLabel>
        {FP.pipe(
          totalRD,
          RD.fold(
            () => <Styled.BalanceLabel>--</Styled.BalanceLabel>,
            () => <Spin size="large" />,
            (error) => (
              <Styled.BalanceError>
                {intl.formatMessage({ id: 'wallet.errors.balancesFailed' }, { errorMsg: error.message })}
              </Styled.BalanceError>
            ),
            (total) => (
              <Styled.BalanceLabel>
                {formatAssetAmountCurrency({
                  amount: baseToAsset(total),
                  asset: pricePool.asset,
                  decimal: isUSDAsset(pricePool.asset) ? 2 : 4
                })}
              </Styled.BalanceLabel>
            )
          )
        )}
      </Styled.BalanceLabel>
    ),
    [intl, pricePool.asset, totalRD]
  )

  return (
    <Styled.Container>
      <Styled.BalanceTitle> {intl.formatMessage({ id: 'wallet.balance.total' })}</Styled.BalanceTitle>
      {renderTotal}
    </Styled.Container>
  )
}
