import React from 'react'

import { SelectionWrapper, Button } from './Selection.styles'

export type Props = {
  onSelect: (value: number) => void
  selected: number
  className?: string
}

export const Selection: React.FC<Props> = ({ selected = 0, onSelect, className = '' }): JSX.Element => {
  function handleClick(value: number) {
    onSelect(value)
  }

  return (
    <SelectionWrapper className={`selection-wrapper ${className}`}>
      <Button onClick={() => handleClick(25)} focused={selected === 25} tabIndex={-1}>
        25%
      </Button>
      <Button onClick={() => handleClick(50)} focused={selected === 50} tabIndex={-1}>
        50%
      </Button>
      <Button onClick={() => handleClick(75)} focused={selected === 75} tabIndex={-1}>
        75%
      </Button>
      <Button onClick={() => handleClick(100)} focused={selected === 100} tabIndex={-1}>
        All
      </Button>
    </SelectionWrapper>
  )
}
