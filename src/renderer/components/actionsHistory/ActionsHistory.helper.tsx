import React from 'react'

import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { FormattedDate, FormattedTime } from 'react-intl'

import { HistoryAction, HistoryActions, HistoryActionsPage, Tx } from '../../services/midgard/types'
import { AssetWithAmount } from '../../types/asgardex'
import * as Styled from './ActionsHistory.styles'

export const getTxId = (action: HistoryAction): O.Option<string> => {
  return FP.pipe(
    action.in,
    A.head,
    O.alt(() => FP.pipe(action.out, A.head)),
    O.map(({ txID }) => txID)
  )
}

export const getValues = (txs: Tx[]): AssetWithAmount[] =>
  FP.pipe(
    txs,
    A.map(({ values }) => values),
    A.flatten
  )

export const renderDate = (date: Date) => (
  <Styled.DateContainer>
    <FormattedDate year={'numeric'} month={'2-digit'} day={'2-digit'} value={date} />
    &nbsp;
    <FormattedTime hour="2-digit" minute="2-digit" hour12={false} value={date} />
  </Styled.DateContainer>
)

export const emptyData: HistoryActionsPage = { total: 0, actions: [] as HistoryActions }
