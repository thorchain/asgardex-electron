/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'

import { TableProps } from 'antd/lib/table'

import { TableWrapper } from './Table.styles'

export type Props = {
  className?: string
}

export const Table: React.FC<Props & TableProps<any>> = (props): JSX.Element => {
  const { className = '', ...otherProps } = props

  return <TableWrapper className={`table-wrapper ${className}`} pagination={false} {...otherProps} />
}
