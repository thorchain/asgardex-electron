import React, { useCallback } from 'react'

import { TxHash } from '@xchainjs/xchain-client'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { sequenceTOption } from '../../../helpers/fpHelpers'
import * as Styled from './ViewTxButton.styles'

type Props = {
  label?: string
  copyable?: boolean
  txHash: O.Option<TxHash>
  onClick: (txHash: string) => void
  className?: string
}

export const ViewTxButton: React.FC<Props> = ({
  onClick,
  txHash: oTxHash,
  label,
  className,
  copyable = false
}): JSX.Element => {
  const intl = useIntl()

  const onClickHandler = useCallback(
    (_) => {
      FP.pipe(oTxHash, O.fold(FP.constUndefined, onClick))
    },
    [oTxHash, onClick]
  )

  return (
    <Styled.Wrapper>
      <Styled.ViewTxButton onClick={onClickHandler} disabled={O.isNone(oTxHash)} className={className}>
        {label || intl.formatMessage({ id: 'common.viewTransaction' })}
      </Styled.ViewTxButton>
      <Styled.CopyLabel
        copyable={
          FP.pipe(
            sequenceTOption(O.fromNullable(copyable), oTxHash),
            O.map(([_, txHash]) => ({
              text: txHash,
              tooltips: intl.formatMessage({ id: 'common.copyTxHash' })
            })),
            O.toUndefined
          ) || false
        }
      />
    </Styled.Wrapper>
  )
}
