/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'

import { TableProps } from 'antd/lib/table'

import { TableWrapper } from './table.style'

export type Props = {
  className?: string
}

const Table: React.FC<Props & TableProps<any>> = (props): JSX.Element => {
  const { className = '', ...otherProps } = props

  return <TableWrapper className={`table-wrapper ${className}`} pagination={false} {...otherProps} />
}

export default Table
