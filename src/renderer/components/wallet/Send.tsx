import React, { useEffect } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset } from '@thorchain/asgardex-util'
import { pipe } from 'fp-ts/lib/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { BinanceContextValue } from '../../contexts/BinanceContext'
import { BalancesRD } from '../../services/binance/types'
import { LoadingView } from '../shared/loading/LoadingView'
import BackLink from '../uielements/backLink'
import * as Styled from './Send.style'
import { SendForm } from './SendForm'

type SendProps = {
  transactionService: BinanceContextValue['transaction']
  balances?: BalancesRD
  initialActiveAsset?: Asset | null
}

const Send: React.FC<SendProps> = ({ transactionService, balances = RD.initial, initialActiveAsset }): JSX.Element => {
  const intl = useIntl()

  useEffect(() => {
    transactionService.resetTx()
  }, [transactionService])

  const transaction = useObservableState(transactionService.transaction$, RD.initial)

  return (
    <>
      <BackLink />
      {pipe(
        transaction,
        RD.fold(
          () => (
            <SendForm
              initialActiveAsset={initialActiveAsset}
              onSubmit={transactionService.pushTx}
              balances={balances}
            />
          ),
          () => <LoadingView />,
          (e) => (
            <Styled.Result
              status="error"
              title={<Styled.Text>{intl.formatMessage({ id: 'common.error' })}</Styled.Text>}
              subTitle={<Styled.Text>{e.message}</Styled.Text>}
              extra={
                <Styled.Button onClick={transactionService.resetTx}>
                  {intl.formatMessage({ id: 'common.back' })}
                </Styled.Button>
              }
            />
          ),
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
