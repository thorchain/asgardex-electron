import React, { useEffect, useState } from 'react'

import { Asset } from '@thorchain/asgardex-util'
import Draggable, {
  ControlPosition,
  DraggableBounds,
  DraggableData,
  DraggableEvent,
  DraggableEventHandler
} from 'react-draggable'

import AssetIcon from '../assets/assetIcon'
import { DragWrapper, TitleLabel } from './Drag.style'

type Props = {
  className?: string
  reset?: boolean
  source: Asset
  target: Asset
  title?: string
  onConfirm?: () => void
  onDrag?: () => void
}

const Drag: React.FC<Props> = ({
  className = '',
  reset = true,
  source,
  target,
  title = '',
  onConfirm = () => {},
  onDrag = () => {},
  ...rest
}: Props): JSX.Element => {
  const [focused, setFocused] = useState<boolean>(true)
  const [overlap, setOverlap] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [disabled, setDisabled] = useState<boolean>(false)
  const [missed, setMissed] = useState<boolean>(false)
  const [dragging, setDragging] = useState<boolean>(false)
  const [pos, setPos] = useState<ControlPosition>({ x: 0, y: 0 })

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
    setFocused(false)
    setSuccess(false)
    setOverlap(false)
    setDisabled(false)
    setDragging(false)
    setMissed(true)
    setPos({ x: 0, y: 0 })
  }

  const handleFocus = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()

    setFocused(true)
  }

  const handleBlur = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
  }

  const handleDragStart: DraggableEventHandler = (e: DraggableEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!focused || disabled) {
      return false
    }

    onDrag()

    setMissed(false)
    setDragging(true)
  }

  const handleDragging: DraggableEventHandler = (e: DraggableEvent, pos: DraggableData) => {
    e.preventDefault()
    e.stopPropagation()

    if (!focused || disabled) {
      return false
    }

    const { x } = pos

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

    setPos(pos)
  }

  const handleDragStop: DraggableEventHandler = (e: DraggableEvent, pos: DraggableData) => {
    if (!focused || disabled) {
      return false
    }

    const { x } = pos

    const successLimit = 190

    if (x >= successLimit) {
      setSuccess(true)
      setOverlap(false)
      setDisabled(true)
      onConfirm()
    } else {
      handleReset()
    }
  }

  const dragHandlers = {
    onStart: handleDragStart,
    onDrag: handleDragging,
    onStop: handleDragStop
  }

  return (
    <div className={`drag-wrapper ${className}`}>
      <DragWrapper overlap={overlap} success={success} missed={missed} dragging={dragging} {...rest}>
        <Draggable position={pos} axis="x" bounds={dragBounds} {...dragHandlers}>
          <AssetIcon
            onMouseEnter={handleFocus}
            onMouseLeave={handleBlur}
            className="source-asset"
            asset={source}
            size="small"
          />
        </Draggable>
        {title && <TitleLabel color="input">{title}</TitleLabel>}
        <AssetIcon className="target-asset" asset={target} size="small" />
      </DragWrapper>
    </div>
  )
}

export default Drag
