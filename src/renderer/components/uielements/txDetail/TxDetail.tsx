import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { baseToAsset, assetToString, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as NEA from 'fp-ts/NonEmptyArray'
import * as O from 'fp-ts/Option'

import { ContainerWithDelimeter } from '../containerWithDelimeter'
import { Fees } from '../fees'
import * as Styled from './TxDetail.styles'
import { ActionProps } from './types'

export const TxDetail: React.FC<ActionProps> = ({ className, outgos, incomes, fees = [], slip }) => {
  const incomeFormatted = useMemo(
    () =>
      FP.pipe(
        incomes,
        A.map(({ asset, amount }) => (
          <Styled.InOutValue key={assetToString(asset) + amount.amount().toString()}>
            {formatAssetAmountCurrency({ trimZeros: true, amount: baseToAsset(amount), asset })}
          </Styled.InOutValue>
        ))
      ),
    [incomes]
  )

  const outgoFormatted = useMemo(
    () =>
      FP.pipe(
        outgos,
        A.map(({ asset, amount }) => (
          <Styled.InOutValue key={assetToString(asset) + amount.amount().toString()}>
            {formatAssetAmountCurrency({ trimZeros: true, amount: baseToAsset(amount), asset })}
          </Styled.InOutValue>
        ))
      ),
    [outgos]
  )

  const feesComponent = useMemo(
    () =>
      FP.pipe(
        fees,
        NEA.fromArray,
        O.map(RD.success),
        O.map((fees) => (
          <ContainerWithDelimeter key="fees">
            <Fees fees={fees} />
          </ContainerWithDelimeter>
        )),
        O.getOrElse(() => <></>)
      ),
    [fees]
  )

  return (
    <Styled.Container className={className}>
      <Styled.ValuesContainer>
        <Styled.InOutValeContainer>
          <Styled.InOutText>in</Styled.InOutText>
          {incomeFormatted}
        </Styled.InOutValeContainer>
        <Styled.InOutValeContainer>
          {outgoFormatted}
          <Styled.InOutText>out</Styled.InOutText>
        </Styled.InOutValeContainer>
      </Styled.ValuesContainer>

      <Styled.AdditionalInfoContainer>
        {feesComponent}
        {slip && <ContainerWithDelimeter>slip: {slip}%</ContainerWithDelimeter>}
      </Styled.AdditionalInfoContainer>
    </Styled.Container>
  )
}
