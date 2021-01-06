import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { TxHash } from '@xchainjs/xchain-client'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { TxRD } from '../../../services/wallet/types'
import { TxTimer } from '../../uielements/txTimer'
import * as Styled from './TxModal.style'

export type Props = {
  txHash?: O.Option<TxHash>
  txRD: TxRD
  timerValue?: number
  title: string
  onClose: FP.Lazy<void>
  onFinish: FP.Lazy<void>
  onViewTxClick?: (txHash: TxHash) => void
  maxSec?: number
  startTime?: number
  extra?: React.ReactNode
}

export const TxModal: React.FC<Props> = (props): JSX.Element => {
  const {
    title,
    txHash: oTxHash = O.none,
    txRD,
    startTime,
    onClose,
    onFinish,
    onViewTxClick = FP.constVoid,
    extra = <></>,
    timerValue = NaN
  } = props

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

  const renderTxButton = useCallback(
    (txHash) => (
      <Styled.ViewTxButton onClick={() => onViewTxClick(txHash)} key={txHash}>
        {intl.formatMessage({ id: 'common.viewTransaction' })}
      </Styled.ViewTxButton>
    ),
    [intl, onViewTxClick]
  )

  const renderResultDetails = useMemo(
    () => (
      <Styled.ResultDetailsContainer>
        <Styled.BtnCopyWrapper>
          <Styled.ViewButton
            disabled={RD.isInitial(txRD) || RD.isPending(txRD)}
            color="success"
            onClick={RD.isSuccess(txRD) ? onFinish : onClose}>
            {intl.formatMessage({ id: RD.isFailure(txRD) ? 'common.cancel' : 'common.finish' })}
          </Styled.ViewButton>

          {FP.pipe(
            oTxHash,
            // render view tx button if
            // 1. txHash property has been set
            O.map(renderTxButton),
            // or
            // 2. txRD is successfull
            O.alt(() => FP.pipe(RD.toOption(txRD), O.map(renderTxButton))),
            O.getOrElse(() => <></>)
          )}
        </Styled.BtnCopyWrapper>
      </Styled.ResultDetailsContainer>
    ),
    [intl, oTxHash, onClose, onFinish, renderTxButton, txRD]
  )

  return (
    <Styled.Modal visible title={title} footer={null} onCancel={onClose}>
      <Styled.ContentRow>
        {renderTimer}
        {renderExtra}
      </Styled.ContentRow>
      {renderResultDetails}
    </Styled.Modal>
  )
}
