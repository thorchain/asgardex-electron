import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'
import { takeWhile } from 'rxjs/operators'

import { TxRD } from '../../../services/wallet/types'
import { TxTimer } from '../../uielements/txTimer'
import * as Styled from './TxModal.style'

export type Props = {
  asset: Asset
  txRD: TxRD
  onClose?: () => void
  onViewTxClick?: (e: React.MouseEvent) => void
  maxSec?: number
  startTime?: number
}

export const TxModal: React.FC<Props> = (props): JSX.Element => {
  const { txRD, startTime = Date.now() } = props

  const intl = useIntl()

  const [txTimerValue] = useObservableState(() => Rx.interval(100).pipe(takeWhile((v) => v <= 95)), 0)

  const i18nTitleId = useMemo(
    () =>
      FP.pipe(
        txRD,
        RD.fold(
          () => 'wallet.upgrade.pending',
          () => 'wallet.upgrade.pending',
          () => 'wallet.upgrade.error',
          () => 'wallet.upgrade.success'
        )
      ),
    [txRD]
  )

  return (
    <Styled.Modal visible={true} title={intl.formatMessage({ id: i18nTitleId })} footer={null}>
      <div>txTimerValue {txTimerValue}</div>
      <Styled.ContentRow>
        <Styled.TimerContainer>
          <TxTimer
            status={true}
            value={txTimerValue}
            maxValue={100}
            maxDuration={Number.MAX_SAFE_INTEGER}
            onEnd={undefined}
            startTime={startTime}
          />
        </Styled.TimerContainer>
      </Styled.ContentRow>
      {RD.isSuccess(txRD) && (
        <Styled.HashWrapper>
          <Styled.BtnCopyWrapper>
            <Styled.ViewButton color="success" onClick={() => 'onClick'}>
              {intl.formatMessage({ id: 'common.finish' })}
            </Styled.ViewButton>

            <Styled.ViewTransaction onClick={() => 'onclick'} href="#" target="_blank" rel="noopener noreferrer">
              {intl.formatMessage({ id: 'common.viewTransaction' })}
            </Styled.ViewTransaction>
          </Styled.BtnCopyWrapper>
        </Styled.HashWrapper>
      )}
    </Styled.Modal>
  )
}
