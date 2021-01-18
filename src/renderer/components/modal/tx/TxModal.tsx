import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { TxRD } from '../../../services/wallet/types'
import { TxTimer } from '../../uielements/txTimer'
import * as Styled from './TxModal.style'

export type Props = {
  txRD: TxRD
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

  const renderResult = useMemo(
    () => (
      <Styled.ResultContainer>
        <Styled.ResultButton
          disabled={RD.isInitial(txRD) || RD.isPending(txRD)}
          color="success"
          onClick={RD.isSuccess(txRD) ? onFinish : onClose}>
          {intl.formatMessage({ id: RD.isFailure(txRD) ? 'common.cancel' : 'common.finish' })}
        </Styled.ResultButton>
        {renderExtraResult}
      </Styled.ResultContainer>
    ),
    [intl, onClose, onFinish, renderExtraResult, txRD]
  )

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
