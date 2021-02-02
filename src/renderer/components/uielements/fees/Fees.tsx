import React, { useEffect, useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { formatFee } from './Fees.helper'
import * as Styled from './Fees.styles'
import { UIFeesRD } from './Fees.types'

type Props = {
  fees: UIFeesRD
  reloadFees?: () => void
  className?: string
}

export const Fees: React.FC<Props> = ({ fees, reloadFees, className }) => {
  const intl = useIntl()

  const prevFeesRef = useRef<O.Option<string>>(O.none)

  const formattedFees = FP.pipe(
    fees,
    RD.map((fees) =>
      FP.pipe(
        fees,
        A.map(formatFee),
        A.reduceWithIndex(
          intl.formatMessage({ id: fees.length > 1 ? 'common.fees' : 'common.fee' }),
          (index, acc, cur) => {
            return index === 0 ? `${acc}: ${cur}` : `${acc} + ${cur}`
          }
        )
      )
    )
  )

  const oFees: O.Option<string> = useMemo(() => FP.pipe(formattedFees, RD.toOption), [formattedFees])

  // Store latest fees as `ref`
  // needed to display previous fee while reloading
  useEffect(() => {
    FP.pipe(
      oFees,
      O.map((fees) => (prevFeesRef.current = O.some(fees)))
    )
  }, [oFees])

  const feesFormattedValue = useMemo(
    () =>
      FP.pipe(
        formattedFees,
        RD.fold(
          () => '...',
          () =>
            // show previous fees while re-loading
            FP.pipe(
              prevFeesRef.current,
              O.map((fees) => fees),
              O.getOrElse(() => '...')
            ),
          (error) => `${intl.formatMessage({ id: 'common.error' })}: ${error.message}`,
          FP.identity
        )
      ),
    [formattedFees, intl]
  )

  return (
    <Styled.Container className={className}>
      {reloadFees && (
        <Styled.ReloadFeeButton
          onClick={(e) => {
            e.preventDefault()
            reloadFees()
          }}
          disabled={RD.isPending(fees)}
        />
      )}
      <Styled.FeeLabel isError={RD.isFailure(fees)} isLoading={RD.isPending(fees)}>
        {feesFormattedValue}
      </Styled.FeeLabel>
    </Styled.Container>
  )
}
