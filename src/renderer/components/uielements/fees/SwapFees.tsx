import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'

import { UISwapFeesRD } from './Fees.types'

export type Props = {
  fees: UISwapFeesRD
  reloadFees: FP.Lazy<void>
  disabled: boolean
  className?: string
}

export const SwapFees: React.FC<Props> = (props) => {
  const { fees: feesRD, reloadFees, disabled = false, className = '' } = props

  const sumPrice = useMemo(
    () =>
      FP.pipe(
        feesRD,
        RD.fold(
          () => 'i',
          () => 'p',
          () => 'e',
          ({ priceInbound: i, priceOutbound: o }) => i.amount.amount().plus(o.amount.amount()).toString()
        )
      ),
    [feesRD]
  )

  return (
    <div className={className}>
      <div>
        <h3>Fees</h3>
        <h1>SUM: {sumPrice}</h1>
      </div>
      <button disabled={disabled} onClick={reloadFees}>
        Reload
      </button>
      <div>{JSON.stringify(feesRD)}</div>
    </div>
  )
}
