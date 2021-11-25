import React, { useMemo } from 'react'

import { CaretDownOutlined } from '@ant-design/icons'
import { Menu, Dropdown } from 'antd'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import { useIntl } from 'react-intl'

import { getTxTypeI18n } from '../../helpers/actionsHelper'
import { TxType as TxTypeUI } from '../uielements/txType'
import * as Styled from './PoolActionsHistoryFilter.styles'
import { Filter } from './types'

type Props = {
  className?: string
  currentFilter: Filter
  onFilterChanged: (targetFilter: Filter) => void
  disabled?: boolean
  availableFilters: Filter[]
}

export const PoolActionsHistoryFilter: React.FC<Props> = ({
  currentFilter,
  onFilterChanged,
  className,
  disabled,
  availableFilters
}) => {
  const intl = useIntl()
  const activeFilterIndex = useMemo(() => {
    const index = availableFilters.indexOf(currentFilter)
    return index > -1 ? index : 0
  }, [currentFilter, availableFilters])

  const allItemContent = useMemo(
    () => (
      <Styled.AllContent>
        <Styled.AllIcon /> {intl.formatMessage({ id: 'common.all' })}
      </Styled.AllContent>
    ),
    [intl]
  )

  const menu = useMemo(() => {
    return (
      <Styled.Menu selectedKeys={[availableFilters[activeFilterIndex]]}>
        {FP.pipe(
          availableFilters,
          A.map((filter) => {
            const content = filter === 'ALL' ? allItemContent : <TxTypeUI type={filter} showTypeIcon />
            return (
              <Menu.Item key={filter} onClick={() => onFilterChanged(filter)}>
                <Styled.FilterItem>{content}</Styled.FilterItem>
              </Menu.Item>
            )
          })
        )}
      </Styled.Menu>
    )
  }, [activeFilterIndex, onFilterChanged, allItemContent, availableFilters])

  return (
    <Dropdown overlay={menu} trigger={['click']} disabled={disabled}>
      <Styled.FilterButton className={className}>
        {currentFilter === 'ALL' ? intl.formatMessage({ id: 'common.all' }) : getTxTypeI18n(currentFilter, intl)}{' '}
        <CaretDownOutlined />{' '}
      </Styled.FilterButton>
    </Dropdown>
  )
}
