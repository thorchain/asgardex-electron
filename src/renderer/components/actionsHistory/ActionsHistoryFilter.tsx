import React, { useMemo } from 'react'

import { CaretDownOutlined } from '@ant-design/icons'
import { Menu, Dropdown } from 'antd'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'

import { TxType } from '../uielements/txType'
import * as Styled from './ActionsHistoryFilter.styles'
import { Filter } from './types'

type Props = {
  currentFilter: Filter
  onFilterChanged: (targetFilter: Filter) => void
}

const FILTER_ITEMS: Filter[] = ['ALL', 'DEPOSIT', 'SWAP', 'DOUBLE_SWAP', 'WITHDRAW']

export const ActionsHistoryFilter: React.FC<Props> = ({ currentFilter, onFilterChanged }) => {
  const activeFilterIndex = useMemo(() => {
    const index = FILTER_ITEMS.indexOf(currentFilter)
    return index > -1 ? index : 0
  }, [currentFilter])
  const menu = useMemo(() => {
    return (
      <Styled.Menu selectedKeys={[FILTER_ITEMS[activeFilterIndex]]} onSelect={console.log}>
        {FP.pipe(
          FILTER_ITEMS,
          A.map((filter) => {
            const content = filter === 'ALL' ? 'all' : <TxType type={filter} />
            return (
              <Menu.Item key={filter} onClick={() => onFilterChanged(filter)}>
                <Styled.FilterItem>{content}</Styled.FilterItem>
              </Menu.Item>
            )
          })
        )}
      </Styled.Menu>
    )
  }, [activeFilterIndex, onFilterChanged])

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Styled.FilterButton>
        filter <CaretDownOutlined />{' '}
      </Styled.FilterButton>
    </Dropdown>
  )
}
