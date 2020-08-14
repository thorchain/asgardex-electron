import React, { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { BinanceContextValue } from '../../../contexts/BinanceContext'
import { AssetWithBalance, FreezeRD } from '../../../services/binance/types'
import ErrorView from '../../shared/error/ErrorView'
import { LoadingView } from '../../shared/loading/LoadingView'
import * as Styled from './Form.style'
import { FreezeForm } from './FreezeForm'
import { FreezeAction } from './types'

type Props = {
  freezeAction: FreezeAction
  freezeService: BinanceContextValue['freeze']
  selectedAsset: AssetWithBalance
}

const Freeze: React.FC<Props> = ({ freezeService, selectedAsset, freezeAction: sendAction }): JSX.Element => {
  const intl = useIntl()

  const { txRD$, resetTx: resetFreeze, pushTx: pushFreeze } = freezeService

  useEffect(() => {
    resetFreeze()
  }, [resetFreeze])

  const txRD = useObservableState<FreezeRD>(txRD$, RD.initial)

  const renderErrorBtn = useMemo(
    () => <Styled.Button onClick={resetFreeze}>{intl.formatMessage({ id: 'common.back' })}</Styled.Button>,
    [intl, resetFreeze]
  )

  return (
    <>
      {FP.pipe(
        txRD,
        RD.fold(
          () => <FreezeForm freezeAction={sendAction} asset={selectedAsset} onSubmit={pushFreeze} />,
          () => <LoadingView />,
          (error) => {
            const msg = error?.toString() ?? ''
            return <ErrorView message={msg} actionButton={renderErrorBtn} />
          },
          (_) => (
            <Styled.Result
              status="success"
              title={<Styled.Text>{intl.formatMessage({ id: 'common.success' })}</Styled.Text>}
              extra={<Styled.Button onClick={freezeService.resetTx}>OK</Styled.Button>}
            />
          )
        )
      )}
    </>
  )
}

export default Freeze
