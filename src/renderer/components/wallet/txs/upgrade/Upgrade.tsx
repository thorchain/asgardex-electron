import React, { useMemo, useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { GetExplorerTxUrl } from '../../../../services/clients'
import { NonEmptyWalletBalances, TxHashRD } from '../../../../services/wallet/types'
import { ErrorView } from '../../../shared/error'
import { SuccessView } from '../../../shared/success'
import { Button } from '../../../uielements/button'
import * as Styled from '../TxForm.style'

/**
 * Upgrade wraps `UpgradeForm` to display states of `TxRD` while upgrading BNB.Rune:
 *
 * initial: UpgradeForm
 * pending: UpgradeForm (which handles a loading state itself)
 * failure: ErrorView
 * success: SuccessView
 *
 * */
export type Props = {
  runeAsset: Asset
  txRD: TxHashRD
  balances: O.Option<NonEmptyWalletBalances>
  getExplorerTxUrl: GetExplorerTxUrl
  successActionHandler?: (txHash: string) => Promise<void>
  errorActionHandler?: FP.Lazy<void>
}

export const Upgrade: React.FC<Props> = (props): JSX.Element => {
  const {
    runeAsset,
    txRD,
    successActionHandler = async () => Promise.resolve(),
    errorActionHandler = FP.constVoid
  } = props
  const intl = useIntl()

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

  const renderUpgradeForm = useMemo(() => <>Upgrade Form {runeAsset}</>, [runeAsset])

  return (
    <>
      {FP.pipe(
        txRD,
        RD.fold(
          () => renderUpgradeForm,
          () => renderUpgradeForm,
          (error) => <ErrorView title={error.msg} extra={renderErrorBtn} />,
          (hash) => <SuccessView title={intl.formatMessage({ id: 'common.success' })} extra={renderSuccessBtn(hash)} />
        )
      )}
    </>
  )
}
