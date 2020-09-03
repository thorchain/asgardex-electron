import React, { useEffect, useMemo, useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { AssetAmount } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/lib/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { BinanceContextValue } from '../../../contexts/BinanceContext'
import { AssetWithBalance, TransferRD, AddressValidation, AssetsWithBalance } from '../../../services/binance/types'
import ErrorView from '../../shared/error/ErrorView'
import SuccessView from '../../shared/success/SuccessView'
import Button from '../../uielements/button'
import * as Styled from './Form.style'
import { SendForm } from './SendForm'

type Props = {
  transactionService: BinanceContextValue['transaction']
  assetsWB: AssetsWithBalance
  selectedAsset: AssetWithBalance
  explorerUrl: O.Option<string>
  addressValidation: AddressValidation
  fee: O.Option<AssetAmount>
}

const Send: React.FC<Props> = (props): JSX.Element => {
  const { transactionService, assetsWB, selectedAsset, explorerUrl = O.none, addressValidation, fee } = props
  const intl = useIntl()

  const { txRD$, resetTx, pushTx } = transactionService

  useEffect(() => {
    resetTx()
  }, [resetTx])

  const txRD = useObservableState<TransferRD>(txRD$, RD.initial)

  const renderErrorBtn = useMemo(
    () => <Styled.Button onClick={resetTx}>{intl.formatMessage({ id: 'common.back' })}</Styled.Button>,
    [intl, resetTx]
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
        <Button round="true" onClick={onClickHandler} sizevalue="normal">
          <Styled.ButtonLinkIcon />
          {intl.formatMessage({ id: 'common.transaction' })}
        </Button>
      )
    },
    [intl, explorerUrl]
  )

  const renderForm = useMemo(
    () => (
      <SendForm
        assetWB={selectedAsset}
        onSubmit={pushTx}
        assetsWB={assetsWB}
        isLoading={RD.isPending(txRD)}
        addressValidation={addressValidation}
        oFee={fee}
      />
    ),
    [selectedAsset, pushTx, assetsWB, txRD, addressValidation, fee]
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
            <SuccessView title={intl.formatMessage({ id: 'common.success' })} extra={renderSuccessBtn(hash)} />
          )
        )
      )}
    </>
  )
}

export default Send
