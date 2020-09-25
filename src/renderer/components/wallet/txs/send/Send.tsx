import React, { useEffect, useMemo, useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/pipeable'
import { useIntl } from 'react-intl'

import { TxRD } from '../../../../services/wallet/types'
import ErrorView from '../../../shared/error/ErrorView'
import SuccessView from '../../../shared/success/SuccessView'
import Button from '../../../uielements/button'
import * as Styled from '../Form.style'

/**
 * Send is a generic component to display states of `TxRD` for any chain
 *
 * initial: SendFormXYZ
 * pending: SendFormXYZ (which handles a loading state itself)
 * failure: ErrorView
 * success: SuccessView
 *
 * */
type Props = {
  txRD: TxRD
  sendForm: JSX.Element
  inititalActionHandler?: () => void
  successActionHandler?: (txHash: string) => void
  errorActionHandler?: () => void
}

const Send: React.FC<Props> = (props): JSX.Element => {
  const {
    txRD,
    inititalActionHandler = () => {},
    successActionHandler = (_: string) => {},
    sendForm,
    errorActionHandler = () => {}
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

  const renderSuccessBtn = useCallback(
    (txHash: string) => (
      <Button round="true" onClick={() => successActionHandler(txHash)} sizevalue="normal">
        <Styled.ButtonLinkIcon />
        {intl.formatMessage({ id: 'common.transaction' })}
      </Button>
    ),
    [intl, successActionHandler]
  )

  return (
    <>
      {FP.pipe(
        txRD,
        RD.fold(
          () => sendForm,
          () => sendForm,
          (error) => <ErrorView title={error.msg} extra={renderErrorBtn} />,
          (hash) => <SuccessView title={intl.formatMessage({ id: 'common.success' })} extra={renderSuccessBtn(hash)} />
        )
      )}
    </>
  )
}

export default Send
