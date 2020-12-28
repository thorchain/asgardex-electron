import React, { useCallback } from 'react'

import { Asset, BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import { TxStatus } from '../../../types/asgardex'
import { PricePoolAsset } from '../../../views/pools/Pools.types'
import { AssetData } from '../../uielements/assets/assetData'
import { StepBar } from '../../uielements/stepBar'
import { Trend } from '../../uielements/trend'
import { TxTimer } from '../../uielements/txTimer'
import * as Styled from './SwapModal.style'

type Props = {
  basePriceAsset?: PricePoolAsset
  slip: BigNumber
  swapSourceAsset: Asset
  swapTargetAsset: Asset
  txStatus: TxStatus
  isCompleted?: boolean
  amountToSwapInSelectedPriceAsset?: BaseAmount
  swapResultByBasePriceAsset?: BaseAmount
  onClose?: () => void
  onChangeTxTimer?: () => void
  onEndTxTimer?: () => void
  onClickFinish?: () => void
  onViewTxClick?: (e: React.MouseEvent) => void
  maxSec?: number
}

export const SwapModal: React.FC<Props> = (props): JSX.Element => {
  const {
    basePriceAsset,
    slip,
    isCompleted = false,
    amountToSwapInSelectedPriceAsset = baseAmount(0),
    swapResultByBasePriceAsset = baseAmount(0),
    swapSourceAsset,
    swapTargetAsset,
    txStatus,
    onClose = () => {},
    onChangeTxTimer = () => {},
    onClickFinish = () => {},
    onEndTxTimer = () => {},
    onViewTxClick = () => {},
    maxSec = Number.MAX_SAFE_INTEGER
  } = props

  const intl = useIntl()

  const swapTitleKey = isCompleted ? 'swap.state.success' : 'swap.swapping'
  const { status, value, startTime, hash } = txStatus

  const onCloseModal = useCallback(() => {
    onClose()
  }, [onClose])

  return (
    <Styled.SwapModalWrapper
      title={intl.formatMessage({ id: swapTitleKey })}
      visible
      footer={null}
      onCancel={onCloseModal}>
      <Styled.SwapModalContent>
        <Styled.SwapModalContentRow>
          <Styled.TimerContainer>
            <TxTimer
              status={status}
              value={value}
              maxValue={100}
              maxSec={maxSec}
              maxDuration={Number.MAX_SAFE_INTEGER}
              startTime={startTime}
              onChange={onChangeTxTimer}
              onEnd={onEndTxTimer}
            />
          </Styled.TimerContainer>
          <Styled.CoinDataWrapper>
            <StepBar size={50} />
            <Styled.CoinDataContainer>
              <AssetData
                priceBaseAsset={basePriceAsset}
                asset={swapSourceAsset}
                price={amountToSwapInSelectedPriceAsset}
              />
              <AssetData priceBaseAsset={basePriceAsset} asset={swapTargetAsset} price={swapResultByBasePriceAsset} />
            </Styled.CoinDataContainer>
          </Styled.CoinDataWrapper>
          <Styled.TrendContainer>
            <Trend amount={slip} />
          </Styled.TrendContainer>
        </Styled.SwapModalContentRow>
        <Styled.SwapInfoWrapper>
          {hash && (
            <Styled.HashWrapper>
              <Styled.BtnCopyWrapper>
                {isCompleted && (
                  <Styled.ViewButton color="success" onClick={onClickFinish}>
                    {intl.formatMessage({ id: 'common.finish' })}
                  </Styled.ViewButton>
                )}
                <Styled.ViewTransaction onClick={onViewTxClick} href="#" target="_blank" rel="noopener noreferrer">
                  {intl.formatMessage({ id: 'common.viewTransaction' })}
                </Styled.ViewTransaction>
              </Styled.BtnCopyWrapper>
            </Styled.HashWrapper>
          )}
        </Styled.SwapInfoWrapper>
      </Styled.SwapModalContent>
    </Styled.SwapModalWrapper>
  )
}
