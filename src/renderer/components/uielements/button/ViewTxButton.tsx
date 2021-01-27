import React, { useCallback } from 'react'

import { TxHash } from '@xchainjs/xchain-client'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import * as Styled from './ViewTxButton.style'

type Props = {
  label?: string
  txHash: O.Option<TxHash>
  onClick: (txHash: string) => void
  className?: string
}

export const ViewTxButton: React.FC<Props> = ({ onClick, txHash: oTxHash, label, className }): JSX.Element => {
  const intl = useIntl()

  const onClickHandler = useCallback(
    (_) => {
      FP.pipe(oTxHash, O.fold(FP.constUndefined, onClick))
    },
    [oTxHash, onClick]
  )

  return (
    <Styled.ViewTxButton onClick={onClickHandler} disabled={O.isNone(oTxHash)} className={className}>
      {label || intl.formatMessage({ id: 'common.viewTransaction' })}
    </Styled.ViewTxButton>
  )
}
