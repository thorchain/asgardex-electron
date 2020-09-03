import React, { useCallback, useState } from 'react'

import { Asset, BaseAmount, baseAmount } from '@thorchain/asgardex-util'

import { TxStatus } from '../../../types/asgardex'
import AssetData from '../../uielements/assets/assetData'
import StepBar from '../../uielements/stepBar'
import Trend from '../../uielements/trend'
import TxTimer from '../../uielements/txTimer'
import * as Styled from './SwapModal.style'
import { CalcResult } from './types'

type Props = {
  calcResult: CalcResult
  swapSource: Asset
  swapTarget: Asset
  txStatus: TxStatus
  isCompleted?: boolean
  priceFrom?: BaseAmount
  priceTo?: BaseAmount
  visible?: boolean
  onClose?: () => void
  onChangeTxTimer?: () => void
  onEndTxTimer?: () => void
  onClickFinish?: () => void
  onViewTxClick?: (e: React.MouseEvent) => void
}

const SwapModal: React.FC<Props> = (props): JSX.Element => {
  const {
    calcResult,
    isCompleted = false,
    priceFrom = baseAmount(0),
    priceTo = baseAmount(0),
    swapSource,
    swapTarget,
    txStatus,
    visible = false,
    onClose = () => {},
    onChangeTxTimer = () => {},
    onClickFinish = () => {},
    onEndTxTimer = () => {},
    onViewTxClick = () => {}
  } = props
  const [openSwapModal, setOpenSwapModal] = useState<boolean>(visible)

  const swapTitle = isCompleted ? 'YOU SWAPPED' : 'YOU ARE SWAPPING'
  const { slip: slipAmount } = calcResult
  const { status, value, startTime, hash } = txStatus

  const onCloseModal = useCallback(() => {
    setOpenSwapModal(!openSwapModal)
    if (onClose) onClose()
  }, [openSwapModal, onClose])

  return (
    <Styled.SwapModalWrapper title={swapTitle} visible={openSwapModal} footer={null} onCancel={onCloseModal}>
      <Styled.SwapModalContent>
        <Styled.SwapModalContentRow>
          <Styled.TimerContainer>
            <TxTimer
              status={status}
              value={value}
              maxValue={100}
              maxSec={45}
              maxDuration={999999999999}
              startTime={startTime}
              onChange={onChangeTxTimer}
              onEnd={onEndTxTimer}
            />
          </Styled.TimerContainer>
          <Styled.CoinDataWrapper>
            <StepBar size={50} />
            <Styled.CoinDataContainer>
              <AssetData asset={swapSource} price={priceFrom} />
              <AssetData asset={swapTarget} price={priceTo} />
            </Styled.CoinDataContainer>
          </Styled.CoinDataWrapper>
        </Styled.SwapModalContentRow>
        <Styled.SwapInfoWrapper>
          <Trend amount={slipAmount} />
          {hash && (
            <Styled.HashWrapper>
              <Styled.BtnCopyWrapper>
                {isCompleted && (
                  <Styled.ViewButton color="success" onClick={onClickFinish}>
                    FINISH
                  </Styled.ViewButton>
                )}
                <Styled.ViewTransaction onClick={onViewTxClick} href="#" target="_blank" rel="noopener noreferrer">
                  VIEW TRANSACTION
                </Styled.ViewTransaction>
              </Styled.BtnCopyWrapper>
            </Styled.HashWrapper>
          )}
        </Styled.SwapInfoWrapper>
      </Styled.SwapModalContent>
    </Styled.SwapModalWrapper>
  )
}

export default SwapModal
