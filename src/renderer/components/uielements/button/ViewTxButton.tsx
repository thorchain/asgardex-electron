import React, { useCallback } from 'react'

import { TxHash } from '@xchainjs/xchain-client'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import * as Styled from './ViewTxButton.styles'

type Props = {
  label?: string
  txHash: O.Option<TxHash>
  txUrl: O.Option<string>
  onClick: (txHash: string) => void
  className?: string
}

export const ViewTxButton: React.FC<Props> = ({
  onClick,
  txHash: oTxHash,
  txUrl: oTxUrl,
  label,
  className
}): JSX.Element => {
  const intl = useIntl()

  const onClickHandler = useCallback(() => {
    FP.pipe(oTxHash, O.fold(FP.constUndefined, onClick))
  }, [oTxHash, onClick])

  return (
    <Styled.Wrapper className={className}>
      <Styled.ViewTxButton onClick={onClickHandler} disabled={O.isNone(oTxHash)}>
        {label || intl.formatMessage({ id: 'common.viewTransaction' })}
      </Styled.ViewTxButton>
      <Styled.CopyLabel
        copyable={
          FP.pipe(
            oTxUrl,
            O.map((url) => ({
              text: url,
              tooltips: intl.formatMessage({ id: 'common.copyTxUrl' })
            })),
            O.toUndefined
          ) || false
        }
      />
    </Styled.Wrapper>
  )
}
