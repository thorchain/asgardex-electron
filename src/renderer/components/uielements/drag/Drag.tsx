import React, { useEffect, useMemo, useState } from 'react'

import { Asset } from '@thorchain/asgardex-util'
import Draggable, { ControlPosition, DraggableBounds, DraggableEvent, DraggableEventHandler } from 'react-draggable'

import { AssetIcon } from '../assets/assetIcon'
import * as Styled from './Drag.style'

type Props = {
  className?: string
  reset?: boolean
  source: Asset
  target: Asset
  title?: string
  onConfirm?: () => void
  onDrag?: () => void
  disabled?: boolean
}

export const Drag: React.FC<Props> = ({
  className = '',
  reset = true,
  source,
  target,
  title = '',
  onConfirm = () => {},
  onDrag = () => {},
  disabled: disabledProp = false,
  ...rest
}: Props): JSX.Element => {
  const [overlap, setOverlap] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [disabledState, setDisabled] = useState<boolean>(false)
  const [missed, setMissed] = useState<boolean>(false)
  const [dragging, setDragging] = useState<boolean>(false)
  const [pos, setPos] = useState<ControlPosition>({ x: 0, y: 0 })

  const disabled = useMemo(() => disabledProp || disabledState, [disabledProp, disabledState])

  const dragBounds: DraggableBounds = {
    left: 0,
    top: 0,
    bottom: 0,
    right: 202
  }

  useEffect(() => {
    if (reset) handleReset()
  }, [reset])

  const handleReset = () => {
    setSuccess(false)
    setOverlap(false)
    setDisabled(false)
    setDragging(false)
    setMissed(true)
    setPos({ x: 0, y: 0 })
  }

  const handleDragStart: DraggableEventHandler = (e: DraggableEvent) => {
    e.preventDefault()
    if (disabled) {
      return false
    }

    onDrag()

    setMissed(false)
    setDragging(true)
  }

  const handleDragging: DraggableEventHandler = (_, data) => {
    if (disabled) {
      return false
    }

    const { x } = data

    const overlapLimit = 164
    const successLimit = 190

    if (x >= successLimit && !success) {
      setSuccess(true)
    }
    if (x >= overlapLimit && !overlap) {
      setOverlap(true)
    } else if (x <= overlapLimit && overlap) {
      setOverlap(false)
    }

    setPos({ x: data.x, y: data.y })
  }

  const handleDragStop: DraggableEventHandler = (_, data) => {
    if (disabled) {
      return false
    }

    const { x } = data

    const successLimit = 190

    if (x >= successLimit) {
      setSuccess(true)
      setOverlap(false)
      setDisabled(true)
      onConfirm()
    }
    handleReset()
  }

  const dragHandlers = {
    onStart: handleDragStart,
    onDrag: handleDragging,
    onStop: handleDragStop
  }
  return (
    <div className={`drag-wrapper ${className}`}>
      <Styled.DragContainer
        disabled={disabled}
        overlap={overlap}
        success={success}
        missed={missed}
        dragging={dragging}
        {...rest}>
        <Draggable disabled={disabled} position={pos} axis="x" bounds={dragBounds} {...dragHandlers}>
          <div className="source-asset">
            <Styled.AssetIcon asset={source} size="small" />
          </div>
        </Draggable>
        {title && <Styled.TitleLabel color="input">{title}</Styled.TitleLabel>}
        <AssetIcon className="target-asset" asset={target} size="small" />
      </Styled.DragContainer>
    </div>
  )
}
