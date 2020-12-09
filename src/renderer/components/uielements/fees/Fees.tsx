import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { BaseAmount, Asset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import { useIntl } from 'react-intl'

import { sequenceTRDFromArray } from '../../../helpers/fpHelpers'
import { formatFee } from './Fees.helper'
import * as Styled from './Fees.styles'

type Fee = {
  amount: BaseAmount
  asset: Asset
}

type Props = {
  fees: RD.RemoteData<Error, Fee>[]
  reloadFees?: () => void
}

export const Fees: React.FC<Props> = ({ fees, reloadFees }) => {
  const intl = useIntl()

  const feesFormattedValue = useMemo(
    () =>
      FP.pipe(
        fees,
        sequenceTRDFromArray,
        RD.map(
          FP.flow(
            A.map(formatFee),
            A.reduce('', (acc, cur) => `${acc}${acc ? ' + ' : ' '}${cur}`)
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
      {intl.formatMessage({ id: fees.length > 1 ? 'common.fees' : 'common.fee' })}: {feesFormattedValue}
    </Styled.Container>
  )
}
