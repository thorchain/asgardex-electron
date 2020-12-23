import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { TxHash } from '@xchainjs/xchain-client'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { emptyFunc } from '../../../helpers/funcHelper'
import { TxRD } from '../../../services/wallet/types'
import { TxTimer } from '../../uielements/txTimer'
import * as Styled from './TxModal.style'

export type Props = {
  txRD: TxRD
  onClose: () => void
  onViewTxClick?: (txHash: TxHash) => void
  maxSec?: number
  startTime?: number
}

export const TxModal: React.FC<Props> = (props): JSX.Element => {
  const { txRD, startTime, onClose, onViewTxClick = emptyFunc } = props

  const intl = useIntl()

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

  const renderTimer = useMemo(
    () =>
      FP.pipe(
        txRD,
        RD.fold(
          () => <TxTimer status={true} />,
          () => <TxTimer status={true} maxValue={100} startTime={startTime} />,
          (error) => <Styled.ErrorView subTitle={error?.msg || intl.formatMessage({ id: 'common.error' })} />,
          () => <TxTimer status={false} />
        )
      ),
    [intl, startTime, txRD]
  )

  const renderResultDetails = useMemo(
    () =>
      FP.pipe(
        txRD,
        RD.map((txHash) => (
          <Styled.ResultDetailsContainer key={txHash}>
            <Styled.BtnCopyWrapper>
              <Styled.ViewButton color="success" onClick={onClose}>
                {intl.formatMessage({ id: 'common.finish' })}
              </Styled.ViewButton>

              <Styled.ViewTransaction onClick={() => onViewTxClick(txHash)}>
                {intl.formatMessage({ id: 'common.viewTransaction' })}
              </Styled.ViewTransaction>
            </Styled.BtnCopyWrapper>
          </Styled.ResultDetailsContainer>
        )),
        RD.getOrElse(() => <></>)
      ),
    [intl, onClose, onViewTxClick, txRD]
  )

  return (
    <Styled.Modal visible={true} title={intl.formatMessage({ id: i18nTitleId })} footer={null} onCancel={onClose}>
      <Styled.ContentRow>{renderTimer}</Styled.ContentRow>
      {renderResultDetails}
    </Styled.Modal>
  )
}
