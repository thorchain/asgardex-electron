import React, { useCallback, useState } from 'react'

import { Asset, BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import { useIntl } from 'react-intl'

import { TxStatus } from '../../../types/asgardex'
import { PricePoolAsset } from '../../../views/pools/Pools.types'
import { AssetData } from '../../uielements/assets/assetData'
import { StepBar } from '../../uielements/stepBar'
import { Trend } from '../../uielements/trend'
import { TxTimer } from '../../uielements/txTimer'
import * as Styled from './SwapModal.style'
import { CalcResult } from './SwapModal.types'

type Props = {
  baseAsset?: PricePoolAsset
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
  maxSec?: number
}

export const SwapModal: React.FC<Props> = (props): JSX.Element => {
  const {
    baseAsset,
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
    onViewTxClick = () => {},
    maxSec = Number.MAX_SAFE_INTEGER
  } = props
  const [openSwapModal, setOpenSwapModal] = useState<boolean>(visible)
  const intl = useIntl()

  const swapTitleKey = isCompleted ? 'swap.state.success' : 'swap.state.pending'
  const { slip: slipAmount } = calcResult
  const { status, value, startTime, hash } = txStatus

  const onCloseModal = useCallback(() => {
    setOpenSwapModal(!openSwapModal)
    if (onClose) onClose()
  }, [openSwapModal, onClose])

  return (
    <Styled.SwapModalWrapper
      title={intl.formatMessage({ id: swapTitleKey })}
      visible={openSwapModal}
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
              <AssetData priceBaseAsset={baseAsset} asset={swapSource} price={priceFrom} />
              <AssetData priceBaseAsset={baseAsset} asset={swapTarget} price={priceTo} />
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
