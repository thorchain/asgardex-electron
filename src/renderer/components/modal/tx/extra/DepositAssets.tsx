import React, { useMemo } from 'react'

import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { Network } from '../../../../../shared/api/types'
import * as Styled from './Common.styles'
import * as C from './Common.types'

export type Props = {
  source: O.Option<C.AssetData>
  target: C.AssetData
  stepDescription: string
  network: Network
}

export const DepositAssets: React.FC<Props> = (props): JSX.Element => {
  const { source: oSource, target, stepDescription, network } = props

  const hasSource = useMemo(() => FP.pipe(oSource, O.isSome), [oSource])

  const renderSource = useMemo(
    () =>
      FP.pipe(
        oSource,
        O.map(({ asset, amount }) => (
          <Styled.AssetData key="source-data" asset={asset} amount={amount} network={network} />
        )),
        O.getOrElse(() => <></>)
      ),
    [oSource, network]
  )

  return (
    <>
      <Styled.StepLabel>{stepDescription}</Styled.StepLabel>
      <Styled.DataWrapper>
        {hasSource && <Styled.StepBar size={50} />}
        <Styled.AssetsContainer>
          {renderSource}
          <Styled.AssetData asset={target.asset} amount={target.amount} network={network} />
        </Styled.AssetsContainer>
      </Styled.DataWrapper>
    </>
  )
}
