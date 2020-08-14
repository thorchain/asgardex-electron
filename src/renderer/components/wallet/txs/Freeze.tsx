import React, { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { BinanceContextValue } from '../../../contexts/BinanceContext'
import { AssetWithBalance, TransferRD } from '../../../services/binance/types'
import ErrorView from '../../shared/error/ErrorView'
import { LoadingView } from '../../shared/loading/LoadingView'
import * as Styled from './Form.style'
import { FreezeForm } from './FreezeForm'
import { FreezeAction } from './types'

type Props = {
  freezeAction: FreezeAction
  transactionService: BinanceContextValue['transaction']
  selectedAsset: AssetWithBalance
}

const Freeze: React.FC<Props> = ({ transactionService, selectedAsset, freezeAction: sendAction }): JSX.Element => {
  const intl = useIntl()

  const { transaction$, resetTx, pushTx } = transactionService

  useEffect(() => {
    resetTx()
  }, [resetTx])

  const transaction = useObservableState<TransferRD>(transaction$, RD.initial)

  const renderErrorBtn = useMemo(
    () => <Styled.Button onClick={resetTx}>{intl.formatMessage({ id: 'common.back' })}</Styled.Button>,
    [intl, resetTx]
  )

  return (
    <>
      {FP.pipe(
        transaction,
        RD.fold(
          () => <FreezeForm freezeAction={sendAction} asset={selectedAsset} onSubmit={pushTx} />,
          () => <LoadingView />,
          (error) => {
            const msg = error?.toString() ?? ''
            return <ErrorView message={msg} actionButton={renderErrorBtn} />
          },
          (_) => (
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

export default Freeze
