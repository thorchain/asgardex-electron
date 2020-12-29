import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import { useIntl } from 'react-intl'

import { formatFee } from './Fees.helper'
import * as Styled from './Fees.styles'
import { UIFeesRD } from './Fees.types'

type Props = {
  fees: UIFeesRD
  reloadFees?: () => void
}

export const Fees: React.FC<Props> = ({ fees, reloadFees }) => {
  const intl = useIntl()

  const feesFormattedValue = useMemo(
    () =>
      FP.pipe(
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
        ),
        RD.fold(
          () => '...',
          () => '...',
          (error) => `${intl.formatMessage({ id: 'common.error' })}: ${error.message}`,
          FP.identity
        )
      ),
    [fees, intl]
  )

  return (
    <Styled.Container>
      {reloadFees && (
        <Styled.ReloadFeeButton
          onClick={(e) => {
            e.preventDefault()
            reloadFees()
          }}
        />
      )}
      {feesFormattedValue}
    </Styled.Container>
  )
}
