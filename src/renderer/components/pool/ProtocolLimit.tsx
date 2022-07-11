import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { AssetRuneNative, baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { LimitRD } from '../../hooks/useProtocolLimit'
import * as Styled from './ProtocolLimit.styles'

export type Props = {
  limit: LimitRD
}

export const ProtocolLimit: React.FC<Props> = (props): JSX.Element => {
  const { limit: limitRD } = props

  const intl = useIntl()

  const render = useMemo(() => {
    const empty = <></>
    return FP.pipe(
      limitRD,
      RD.fold(
        () => empty,
        () => empty,
        (_) => empty,
        ({ reached, totalActiveBondAmount, totalPooledRuneAmount }) => {
          const msg = intl.formatMessage(
            { id: 'pools.limit.info' },
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

          return reached ? <Styled.Alert type="error" message={msg} /> : empty
        }
      )
    )
  }, [limitRD, intl])

  return render
}
