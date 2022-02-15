import React, { useEffect, useMemo, useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { OpenExplorerTxUrl } from '../../../../services/clients'
import { TxHashRD } from '../../../../services/wallet/types'
import { ErrorView } from '../../../shared/error/'
import { SuccessView } from '../../../shared/success/'
import { ViewTxButton } from '../../../uielements/button/ViewTxButton'
import * as Styled from '../TxForm.styles'

/**
 * Send is a generic component to display states of `TxRD` for any chain
 *
 * initial: SendFormXYZ
 * pending: SendFormXYZ (which handles a loading state itself)
 * failure: ErrorView
 * success: SuccessView
 *
 * */
export type Props = {
  txRD: TxHashRD
  sendForm: JSX.Element
  inititalActionHandler?: FP.Lazy<void>
  viewTxHandler: OpenExplorerTxUrl
  finishActionHandler?: FP.Lazy<void>
  errorActionHandler?: FP.Lazy<void>
}

export const Send: React.FC<Props> = (props): JSX.Element => {
  const {
    txRD,
    inititalActionHandler = FP.constVoid,
    viewTxHandler = async () => Promise.resolve(),
    finishActionHandler = FP.constVoid,
    sendForm,
    errorActionHandler = FP.constVoid
  } = props
  const intl = useIntl()

  useEffect(() => {
    inititalActionHandler()
  }, [inititalActionHandler])

  const renderErrorBtn = useMemo(
    () => (
      <Styled.Button onClick={() => errorActionHandler()}>{intl.formatMessage({ id: 'common.back' })}</Styled.Button>
    ),
    [errorActionHandler, intl]
  )

  const renderSuccessExtra = useCallback(
    (txHash: string) => {
      const onClickHandler = () => viewTxHandler(txHash)
      return (
        <Styled.SuccessExtraContainer>
          <Styled.SuccessExtraButton onClick={finishActionHandler}>
            {intl.formatMessage({ id: 'common.back' })}
          </Styled.SuccessExtraButton>
          <ViewTxButton txHash={O.some(txHash)} onClick={onClickHandler} />
        </Styled.SuccessExtraContainer>
      )
    },
    [intl, finishActionHandler, viewTxHandler]
  )

  return (
    <>
      {FP.pipe(
        txRD,
        RD.fold(
          () => sendForm,
          () => sendForm,
          (error) => <ErrorView title={error.msg} extra={renderErrorBtn} />,
          (hash) => (
            <SuccessView
              title={intl.formatMessage({ id: 'common.tx.success' })}
              subTitle={intl.formatMessage({ id: 'common.tx.success-info' })}
              extra={renderSuccessExtra(hash)}
            />
          )
        )
      )}
    </>
  )
}
