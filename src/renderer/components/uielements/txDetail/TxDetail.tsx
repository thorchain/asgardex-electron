import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { baseToAsset, assetToString, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as NEA from 'fp-ts/NonEmptyArray'
import * as O from 'fp-ts/Option'

import { AssetWithAmount } from '../../../types/asgardex'
import { Fees } from '../fees'
import * as Styled from './TxDetail.styles'

type Props = {
  incomes: AssetWithAmount[]
  outgos: AssetWithAmount[]
  fees?: AssetWithAmount[]
  /**
   * Possible transaction slip in percents
   */
  slip?: number
  className?: string
  date: Date
  renderDate: (date: Date) => React.ReactElement
  isDesktopView?: boolean
}

export const TxDetail: React.FC<Props> = ({
  className,
  outgos,
  incomes,
  fees = [],
  slip,
  date,
  renderDate,
  isDesktopView = true
}) => {
  const incomeFormatted = useMemo(
    () =>
      FP.pipe(
        incomes,
        A.map(({ asset, amount }) => (
          <Styled.InOutValue key={assetToString(asset)}>
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
          <Styled.InOutValue key={assetToString(asset)}>
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
          <Styled.ContainerWithDelimeter key="fees">
            <Fees fees={fees} />
          </Styled.ContainerWithDelimeter>
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

      {isDesktopView && (
        <Styled.AdditionalInfoContainer>
          {feesComponent}
          {slip && <Styled.ContainerWithDelimeter>slip: {slip}%</Styled.ContainerWithDelimeter>}
        </Styled.AdditionalInfoContainer>
      )}
      <Styled.DateContainer>{renderDate(date)}</Styled.DateContainer>
    </Styled.Container>
  )
}
