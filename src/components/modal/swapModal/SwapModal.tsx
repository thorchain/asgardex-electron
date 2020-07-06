import React, { useCallback, useState } from 'react'

import BigNumber from 'bignumber.js'

import { TxStatus } from '../../../types/asgardex'
import CoinData from '../../uielements/coins/coinData'
import StepBar from '../../uielements/stepBar'
import Trend from '../../uielements/trend'
import TxTimer from '../../uielements/txTimer'
import {
  SwapModalWrapper,
  SwapModalContent,
  SwapModalContentRow,
  TimerContainer,
  CoinDataWrapper,
  CoinDataContainer,
  SwapInfoWrapper,
  HashWrapper,
  BtnCopyWrapper,
  ViewButton,
  ViewTransaction
} from './SwapModal.style'
import { CalcResult } from './types'

type Props = {
  calcResult: CalcResult
  isCompleted?: boolean
  priceFrom?: BigNumber
  priceTo?: BigNumber
  swapSource: string
  swapTarget: string
  txStatus: TxStatus
  visible?: boolean
  onClose?: () => void
  onChangeTxTimer?: () => void
  onEndTxTimer?: () => void
  onClickFinish?: () => void
}

const SwapModal: React.FC<Props> = (props): JSX.Element => {
  const {
    calcResult,
    isCompleted = false,
    priceFrom = new BigNumber(0),
    priceTo = new BigNumber(0),
    swapSource,
    swapTarget,
    txStatus,
    visible = false,
    onClose = () => {},
    onChangeTxTimer = () => {},
    onClickFinish = () => {},
    onEndTxTimer = () => {}
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
    <SwapModalWrapper title={swapTitle} visible={openSwapModal} footer={null} onCancel={onCloseModal}>
      <SwapModalContent>
        <SwapModalContentRow>
          <TimerContainer>
            <TxTimer
              status={status}
              value={value}
              maxValue={100}
              maxSec={45}
              startTime={startTime}
              onChange={onChangeTxTimer}
              onEnd={onEndTxTimer}
            />
          </TimerContainer>
          <CoinDataWrapper>
            <StepBar size={50} />
            <CoinDataContainer>
              <CoinData asset={swapSource} price={priceFrom} priceUnit={swapSource} />
              <CoinData asset={swapTarget} price={priceTo} priceUnit={swapTarget} />
            </CoinDataContainer>
          </CoinDataWrapper>
        </SwapModalContentRow>
        <SwapInfoWrapper>
          <Trend amount={slipAmount} />
          {hash && (
            <HashWrapper>
              <BtnCopyWrapper>
                {isCompleted && (
                  <ViewButton color="success" onClick={onClickFinish}>
                    FINISH
                  </ViewButton>
                )}
                <ViewTransaction href="#" target="_blank" rel="noopener noreferrer">
                  VIEW TRANSACTION
                </ViewTransaction>
              </BtnCopyWrapper>
            </HashWrapper>
          )}
        </SwapInfoWrapper>
      </SwapModalContent>
    </SwapModalWrapper>
  )
}

export default SwapModal
