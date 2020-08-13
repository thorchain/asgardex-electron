import React, { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { BinanceContextValue } from '../../contexts/BinanceContext'
import { AssetWithBalance, AssetsWithBalance } from '../../services/binance/types'
import ErrorView from '../shared/error/ErrorView'
import { LoadingView } from '../shared/loading/LoadingView'
import * as Styled from './Send.style'
import { SendForm } from './SendForm'
import { SendAction } from './types'

type SendProps = {
  sendAction: SendAction
  transactionService: BinanceContextValue['transaction']
  balances: AssetsWithBalance
  selectedAsset: AssetWithBalance
}

const Send: React.FC<SendProps> = ({ transactionService, balances, selectedAsset, sendAction }): JSX.Element => {
  const intl = useIntl()

  const { transaction$, resetTx, pushTx } = transactionService

  useEffect(() => {
    resetTx()
  }, [resetTx])

  const transaction = useObservableState(transaction$, RD.initial)

  const renderErrorBtn = useMemo(
    () => <Styled.Button onClick={resetTx}>{intl.formatMessage({ id: 'common.back' })}</Styled.Button>,
    [intl, resetTx]
  )

  return (
    <>
      {FP.pipe(
        transaction,
        RD.fold(
          () => <SendForm sendAction={sendAction} asset={selectedAsset} onSubmit={pushTx} assets={balances} />,
          () => <LoadingView />,
          (error) => {
            const msg = error?.toString() ?? ''
            return <ErrorView message={msg} actionButton={renderErrorBtn} />
          },
          () => (
            <Styled.Result
              status="success"
              title={<Styled.Text>{intl.formatMessage({ id: 'common.success' })}</Styled.Text>}
              extra={<Styled.Button onClick={transactionService.resetTx}>OK</Styled.Button>}
            />
          )
        )
      )}
    </>
  )
}

export default Send
