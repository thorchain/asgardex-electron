import React, { useState, useMemo } from 'react'

import { assetAmount, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import { Row, Dropdown } from 'antd'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'

import { ReactComponent as DownIcon } from '../../assets/svg/icon-down.svg'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { PoolAssetDetail } from '../../services/midgard/types'
import * as Styled from './CurrencyInfo.styles'

type CurrencyInfoProps = {
  from?: O.Option<PoolAssetDetail>
  to?: O.Option<PoolAssetDetail>
  slip?: BigNumber
}

const SLIP_PERCENTAGES = [3, 5, 10]

export const CurrencyInfo = ({ to = O.none, from = O.none }: CurrencyInfoProps) => {
  const [slipSettingsVisible, setSlipSettingsVisible] = useState(false)
  const [currentSlip, setCurrentSlip] = useState(SLIP_PERCENTAGES[1])

  const slipSettings = useMemo(() => {
    return (
      <>
        {SLIP_PERCENTAGES.map((slip) => (
          <Row
            style={{ alignItems: 'center' }}
            key={slip}
            onClick={() => {
              setCurrentSlip(slip)
              setSlipSettingsVisible(false)
            }}>
            <Styled.SlipLabel slip={`${slip}%`}>{slip}%</Styled.SlipLabel>
          </Row>
        ))}
      </>
    )
  }, [])

  const renderSlipSettings = useMemo(
    () => (
      <Dropdown overlay={slipSettings} trigger={['click']} placement="bottomCenter">
        <Styled.DropdownContentWrapper>
          <Row style={{ alignItems: 'center' }}>
            <Styled.SlipLabel slip={`${currentSlip}%`}>{currentSlip}%</Styled.SlipLabel>
            <DownIcon />
          </Row>
        </Styled.DropdownContentWrapper>
      </Dropdown>
    ),
    [slipSettings, currentSlip]
  )

  return pipe(
    sequenceTOption(from, to),
    O.map(([from, to]) => {
      return (
        <Styled.Container key={'currency info'}>
          <div>
            {formatAssetAmountCurrency({
              asset: from.asset,
              amount: assetAmount(1),
              trimZeros: true
            })}{' '}
            ={' '}
            {formatAssetAmountCurrency({
              asset: to.asset,
              amount: assetAmount(from.assetPrice.dividedBy(to.assetPrice)),
              trimZeros: true
            })}
          </div>
          <div>
            {formatAssetAmountCurrency({
              asset: to.asset,
              amount: assetAmount(1),
              trimZeros: true
            })}{' '}
            ={' '}
            {formatAssetAmountCurrency({
              asset: from.asset,
              amount: assetAmount(to.assetPrice.dividedBy(from.assetPrice)),
              trimZeros: true
            })}
          </div>
          <div>
            slip: {currentSlip}%{' '}
            <Styled.SlipSettings
              active={slipSettingsVisible}
              onClick={() => setSlipSettingsVisible(!slipSettingsVisible)}
            />
            {slipSettingsVisible && (
              <div>
                <Styled.SlipToleranceText>slippage tolerance</Styled.SlipToleranceText>
                {renderSlipSettings}
              </div>
            )}
          </div>
        </Styled.Container>
      )
    }),
    O.toNullable
  )
}
