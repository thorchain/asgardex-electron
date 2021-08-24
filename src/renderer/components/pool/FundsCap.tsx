import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { AssetRuneNative, baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { FundsCapRD } from '../../hooks/useFundsCap'
import * as Styled from './FundsCap.styles'

export type Props = {
  fundsCap: FundsCapRD
}

export const FundsCap: React.FC<Props> = (props): JSX.Element => {
  const { fundsCap: fundsCapRD } = props

  const label = useMemo(
    () =>
      FP.pipe(
        fundsCapRD,
        RD.fold(
          () => '..',
          () => '...',
          // TODO (@Veado) Add i18n
          (_) => 'Error to get funds cap',
          (oFundsCap) =>
            FP.pipe(
              oFundsCap,
              O.map(
                ({ reached, pooledRuneAmount, maxPooledRuneAmount }) =>
                  `${formatAssetAmountCurrency({
                    amount: baseToAsset(pooledRuneAmount),
                    asset: AssetRuneNative,
                    decimal: 0
                  })} / ${formatAssetAmountCurrency({
                    amount: baseToAsset(maxPooledRuneAmount),
                    asset: AssetRuneNative,
                    decimal: 0
                  })} pooled ${reached ? '- cap reached' : ''}`
              ),
              O.getOrElse(() => 'No funds cap')
            )
        )
      ),
    [fundsCapRD]
  )

  return <Styled.Container>{label}</Styled.Container>
}
