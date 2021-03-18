import React, { useEffect, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Grid } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { HistoryActionsPage } from '../../services/midgard/types'
import { ActionsHistoryList } from './ActionsHistoryList'
import { ActionsHistoryTable } from './ActionsHistoryTable'
import { Props } from './types'

export const ActionsHistory: React.FC<Props> = (props) => {
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false
  // store previous data of Txs to render these while reloading
  const previousTxs = useRef<O.Option<HistoryActionsPage>>(O.none)

  useEffect(() => {
    FP.pipe(
      props.actionsPageRD,
      RD.map((data) => {
        previousTxs.current = O.some(data)
        return true
      })
    )
  }, [props])

  return isDesktopView ? (
    <ActionsHistoryTable prevActionsPage={previousTxs.current} {...props} />
  ) : (
    <ActionsHistoryList prevActionsPage={previousTxs.current} {...props} />
  )
}
