import React, { useMemo } from 'react'

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
  hasCrossChainFee?: boolean
}

export const Fees: React.FC<Props> = ({ fees, hasCrossChainFee }) => {
  const intl = useIntl()

  const feesFormattedValue = useMemo(
    () =>
      FP.pipe(
        fees,
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
    <>
      {intl.formatMessage({ id: hasCrossChainFee ? 'common.fees' : 'common.fee' })}: {feesFormattedValue}
    </>
  )
}
