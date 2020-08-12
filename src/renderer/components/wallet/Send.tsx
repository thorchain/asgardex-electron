import React, { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { BinanceContextValue } from '../../contexts/BinanceContext'
import { AssetWithBalance } from '../../types/asgardex'
import ErrorView from '../shared/error/ErrorView'
import { LoadingView } from '../shared/loading/LoadingView'
import BackLink from '../uielements/backLink'
import * as Styled from './Send.style'
import { SendForm } from './SendForm'

type SendProps = {
  transactionService: BinanceContextValue['transaction']
  balances?: RD.RemoteData<Error, AssetWithBalance[]>
  initialActiveAsset?: RD.RemoteData<Error, O.Option<AssetWithBalance>>
}

const Send: React.FC<SendProps> = ({
  transactionService,
  balances = RD.initial,
  initialActiveAsset = RD.initial
}): JSX.Element => {
  const intl = useIntl()

  useEffect(() => {
    transactionService.resetTx()
  }, [transactionService])

  const transaction = useObservableState(transactionService.transaction$, RD.initial)

  const sendForm = useMemo(
    () =>
      pipe(
        RD.combine(balances, initialActiveAsset),
        RD.fold(
          () => <></>,
          () => <LoadingView />,
          (e) => <ErrorView message={e.message} />,
          ([balances, initialActiveAsset]) => (
            <SendForm
              initialActiveAsset={initialActiveAsset}
              onSubmit={transactionService.pushTx}
              balances={balances}
            />
          )
        )
      ),
    [balances, initialActiveAsset, transactionService]
  )

  return (
    <>
      <BackLink />
      {pipe(
        transaction,
        RD.fold(
          () => sendForm,
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
