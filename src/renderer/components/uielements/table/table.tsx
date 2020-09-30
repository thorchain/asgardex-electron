import React, { PropsWithChildren } from 'react'

import { TableProps } from 'antd/lib/table'

import { TableWrapper } from './table.style'

type ComponentProps<T> = {
  className?: string
} & TableProps<T>

export type Props<T> = PropsWithChildren<ComponentProps<T>>

const Table = <T extends {}>(props: Props<T>): JSX.Element => {
  const { className = '', ...otherProps } = props

  return <TableWrapper className={`table-wrapper ${className}`} pagination={false} {...otherProps} />
}

export default Table
