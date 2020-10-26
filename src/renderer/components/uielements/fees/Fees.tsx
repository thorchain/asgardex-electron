import React, { useRef, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { BaseAmount, Asset } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import { useIntl } from 'react-intl'

import { formatFee } from './Fees.helper'

type Fee = {
  amount: BaseAmount
  asset: Asset
}

type Props = {
  fees: RD.RemoteData<Error, Fee[]>
}

export const Fees: React.FC<Props> = ({ fees }) => {
  const intl = useIntl()

  const prevFeesRef = useRef<string>('...')

  const isSingleFee = FP.pipe(
    fees,
    RD.map((fees) => fees.length === 1),
    RD.getOrElse(() => false)
  )

  const feesFormattedValue = useMemo(
    () =>
      FP.pipe(
        fees,
        RD.map(
          FP.flow(
            A.map(formatFee),
            A.reduce('', (acc, cur) => `${acc} ${cur}`)
          )
        ),
        RD.fold(
          () => <>{prevFeesRef.current}</>,
          () => <>{prevFeesRef.current}</>,
          (error) => <>{error.message}</>,
          (fees) => {
            prevFeesRef.current = fees
            return <>{fees}</>
          }
        )
      ),
    [fees]
  )

  return (
    <>
      {intl.formatMessage({ id: isSingleFee ? 'common.fee' : 'common.fees' })}:{feesFormattedValue}
    </>
  )
}
