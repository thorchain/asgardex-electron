import React, { useEffect, useMemo, useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/lib/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { BinanceContextValue } from '../../../../contexts/BinanceContext'
import { TxRD } from '../../../../services/wallet/types'
import ErrorView from '../../../shared/error/ErrorView'
import SuccessView from '../../../shared/success/SuccessView'
import Button from '../../../uielements/button'
import * as Styled from '../Form.style'

type Props = {
  transactionService: BinanceContextValue['transaction']
  explorerUrl: O.Option<string>
  form: JSX.Element
  resetTx: () => void
}

const Send: React.FC<Props> = (props): JSX.Element => {
  const { transactionService, explorerUrl = O.none, form, resetTx } = props
  const intl = useIntl()

  const { txRD$ } = transactionService

  useEffect(() => {
    resetTx()
  }, [resetTx])

  const txRD = useObservableState<TxRD>(txRD$, RD.initial)

  const renderErrorBtn = useMemo(
    () => <Styled.Button onClick={resetTx}>{intl.formatMessage({ id: 'common.back' })}</Styled.Button>,
    [intl, resetTx]
  )

  const renderSuccessBtn = useCallback(
    (txHash: string) => {
      const onClickHandler = () => {
        FP.pipe(
          explorerUrl,
          O.map((url) => window.apiUrl.openExternal(`${url}/tx/${txHash}`))
        )
      }
      return (
        <Button round="true" onClick={onClickHandler} sizevalue="normal">
          <Styled.ButtonLinkIcon />
          {intl.formatMessage({ id: 'common.transaction' })}
        </Button>
      )
    },
    [intl, explorerUrl]
  )

  return (
    <>
      {FP.pipe(
        txRD,
        RD.fold(
          () => form,
          () => form,
          (error) => {
            const msg = error?.toString() ?? ''
            return <ErrorView title={msg} extra={renderErrorBtn} />
          },
          (hash) => <SuccessView title={intl.formatMessage({ id: 'common.success' })} extra={renderSuccessBtn(hash)} />
        )
      )}
    </>
  )
}

export default Send
