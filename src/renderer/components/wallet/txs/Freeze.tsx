import React, { useEffect, useMemo, useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/lib/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { BinanceContextValue } from '../../../contexts/BinanceContext'
import { AssetWithBalance, FreezeRD, FreezeAction } from '../../../services/binance/types'
import ErrorView from '../../shared/error/ErrorView'
import SuccessView from '../../shared/success/SuccessView'
import Button from '../../uielements/button'
import * as Styled from './Form.style'
import { FreezeForm } from './FreezeForm'

type Props = {
  freezeAction: FreezeAction
  freezeService: BinanceContextValue['freeze']
  selectedAsset: AssetWithBalance
  explorerUrl: O.Option<string>
}

const Freeze: React.FC<Props> = (props: Props): JSX.Element => {
  const { freezeService, selectedAsset, freezeAction: sendAction, explorerUrl = O.none } = props
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

  const renderSuccessBtn = useCallback(
    (txHash: string) => {
      const onClickHandler = () => {
        FP.pipe(
          explorerUrl,
          O.map((url) => window.apiUrl.openExternal(`${url}/tx/${txHash}`))
        )
      }
      return (
        <Button round="true" onClick={onClickHandler}>
          <Styled.ButtonLinkIcon />
          {intl.formatMessage({ id: 'common.transaction' })}
        </Button>
      )
    },
    [intl, explorerUrl]
  )

  const renderForm = useMemo(
    () => (
      <FreezeForm
        freezeAction={sendAction}
        asset={selectedAsset}
        onSubmit={pushFreeze}
        isLoading={RD.isPending(txRD)}
      />
    ),
    [pushFreeze, selectedAsset, sendAction, txRD]
  )

  return (
    <>
      {FP.pipe(
        txRD,
        RD.fold(
          () => renderForm,
          () => renderForm,
          (error) => {
            const msg = error?.toString() ?? ''
            return <ErrorView title={msg} extra={renderErrorBtn} />
          },
          ({ hash }) => (
            <SuccessView title={intl.formatMessage({ id: 'wallet.send.success' })} extra={renderSuccessBtn(hash)} />
          )
        )
      )}
    </>
  )
}

export default Freeze
