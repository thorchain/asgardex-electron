import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { ApiError } from '../../../services/wallet/types'
import { ButtonProps as UIButtonProps } from '../../uielements/button'
import { TxTimer } from '../../uielements/txTimer'
import * as Styled from './TxModal.styles'

export type Props = {
  txRD: RD.RemoteData<ApiError, boolean>
  timerValue?: number
  title: string
  onClose: FP.Lazy<void>
  onFinish: FP.Lazy<void>
  maxSec?: number
  startTime?: number
  extra?: React.ReactNode
  extraResult?: React.ReactNode
}

export const TxModal: React.FC<Props> = (props): JSX.Element => {
  const { title, txRD, startTime, onClose, onFinish, extra = <></>, extraResult, timerValue = NaN } = props

  const intl = useIntl()

  const renderTimer = useMemo(
    () => (
      <Styled.SubContentRow>
        {FP.pipe(
          txRD,
          RD.fold(
            () => <TxTimer status={true} />,
            () => <TxTimer status={true} maxValue={100} value={timerValue} startTime={startTime} />,
            (error) => <Styled.ErrorView subTitle={error?.msg || intl.formatMessage({ id: 'common.error' })} />,
            () => <TxTimer status={false} />
          )
        )}
      </Styled.SubContentRow>
    ),
    [intl, startTime, txRD, timerValue]
  )

  const renderExtra = useMemo(() => <Styled.SubContentRow>{extra}</Styled.SubContentRow>, [extra])
  const renderExtraResult = useMemo(
    () => (extraResult ? <Styled.ExtraResultContainer>{extraResult}</Styled.ExtraResultContainer> : <></>),
    [extraResult]
  )

  const renderResult = useMemo(() => {
    const defaultButtonProps: UIButtonProps = {
      color: 'success',
      disabled: false,
      onClick: onClose,
      sizevalue: 'xnormal',
      round: 'true',
      children: <>{intl.formatMessage({ id: 'common.finish' })}</>
    }

    const buttonProps: UIButtonProps = FP.pipe(
      txRD,
      RD.fold<ApiError, boolean, UIButtonProps>(
        () => ({ ...defaultButtonProps, disabled: true }),
        () => ({ ...defaultButtonProps, disabled: true }),
        () => ({ ...defaultButtonProps, children: intl.formatMessage({ id: 'common.finish' }) }),
        () => ({ ...defaultButtonProps, onClick: onFinish })
      )
    )

    return (
      <Styled.ResultContainer>
        <Styled.ResultButton {...buttonProps} />
        {renderExtraResult}
      </Styled.ResultContainer>
    )
  }, [intl, onClose, onFinish, renderExtraResult, txRD])

  return (
    <Styled.Modal visible title={title} footer={null} onCancel={onClose}>
      <Styled.ContentRow>
        {renderTimer}
        {renderExtra}
      </Styled.ContentRow>
      {renderResult}
    </Styled.Modal>
  )
}
