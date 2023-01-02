import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { isUSDAsset } from '../../../helpers/assetHelper'
import { hiddenString } from '../../../helpers/stringHelper'
import { BaseAmountRD } from '../../../types'
import { PricePool } from '../../../views/pools/Pools.types'
import { InfoIcon } from '../../uielements/info'
import * as Styled from './TotalValue.styles'

type Props = {
  pricePool: PricePool
  total: BaseAmountRD
  title: string
  info?: string
  hidePrivateData: boolean
}

export const TotalValue: React.FC<Props> = (props): JSX.Element => {
  const { pricePool, total: totalRD, title, info, hidePrivateData } = props

  const intl = useIntl()

  const renderTotal = useMemo(
    () =>
      FP.pipe(
        totalRD,
        RD.fold(
          () => <Styled.BalanceLabel>--</Styled.BalanceLabel>,
          () => <Styled.Spin />,
          (error) => (
            <Styled.BalanceError>
              {intl.formatMessage({ id: 'wallet.errors.balancesFailed' }, { errorMsg: error.message })}
            </Styled.BalanceError>
          ),
          (total) => (
            <Styled.BalanceLabel>
              {hidePrivateData
                ? hiddenString
                : formatAssetAmountCurrency({
                    amount: baseToAsset(total),
                    asset: pricePool.asset,
                    decimal: isUSDAsset(pricePool.asset) ? 2 : 4
                  })}
            </Styled.BalanceLabel>
          )
        )
      ),
    [hidePrivateData, intl, pricePool.asset, totalRD]
  )

  return (
    <Styled.Container>
      <Styled.TitleContainer>
        <Styled.BalanceTitle>{title}</Styled.BalanceTitle>
        {info && <InfoIcon tooltip={info} color="primary" />}
      </Styled.TitleContainer>
      {renderTotal}
    </Styled.Container>
  )
}
