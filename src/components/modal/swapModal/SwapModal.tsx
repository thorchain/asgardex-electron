import React, { useState } from 'react'

import { Row } from 'antd'
import BigNumber from 'bignumber.js'

import { TxStatus } from '../../../types/asgardex'
import Button from '../../uielements/button'
import CoinData from '../../uielements/coins/coinData'
import StepBar from '../../uielements/stepBar'
import Trend from '../../uielements/trend'
import TxTimer from '../../uielements/txTimer'
import { SwapModalWrapper, SwapModalContent } from './SwapModal.style'
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

  const onCloseModal = () => {
    setOpenSwapModal(!openSwapModal)
    if (onClose) onClose()
  }

  return (
    <SwapModalWrapper title={swapTitle} visible={openSwapModal} footer={null} onCancel={onCloseModal}>
      <SwapModalContent>
        <Row className="swapmodal-content">
          <div className="timer-container">
            <TxTimer
              status={status}
              value={value}
              maxValue={100}
              maxSec={45}
              startTime={startTime}
              onChange={onChangeTxTimer}
              onEnd={onEndTxTimer}
            />
          </div>
          <div className="coin-data-wrapper">
            <StepBar size={50} />
            <div className="coin-data-container">
              <CoinData asset={swapSource} price={priceFrom} priceUnit={swapSource} />
              <CoinData asset={swapTarget} price={priceTo} priceUnit={swapTarget} />
            </div>
          </div>
        </Row>
        <Row className="swap-info-wrapper">
          <Trend amount={slipAmount} />
          {hash && (
            <div className="hash-address">
              <div className="copy-btn-wrapper">
                {isCompleted && (
                  <Button className="view-btn" color="success" onClick={onClickFinish}>
                    FINISH
                  </Button>
                )}
                <a className="view-tx" href="#" target="_blank" rel="noopener noreferrer">
                  VIEW TRANSACTION
                </a>
              </div>
            </div>
          )}
        </Row>
      </SwapModalContent>
    </SwapModalWrapper>
  )
}

export default SwapModal
