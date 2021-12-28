import React, { RefObject, useCallback, useMemo, useRef, useState } from 'react'

import { SearchOutlined } from '@ant-design/icons'
import { MenuProps } from 'antd/lib/menu'
import { useIntl } from 'react-intl'

import { useClickOutside } from '../../../hooks/useOutsideClick'
import * as Styled from './FilterMenu.styles'

type Props<T> = {
  asset?: string
  data: T[]
  placeholder?: string
  searchEnabled?: boolean
  cellRenderer: (data: T) => { key: string; node: JSX.Element }
  disableItemFilter?: (item: T) => boolean
  filterFunction: (item: T, searchTerm: string) => boolean
  onSelect?: (value: string) => void
  closeMenu?: () => void
}

export const FilterMenu = <T,>(props: Props<T>): JSX.Element => {
  const {
    onSelect = (_) => {},
    searchEnabled = false,
    data,
    filterFunction,
    cellRenderer,
    disableItemFilter = (_) => false,
    placeholder,
    closeMenu
  } = props

  const intl = useIntl()

  const [searchTerm, setSearchTerm] = useState('')

  const handleClick: MenuProps['onClick'] = useCallback(
    (event) => {
      // (Rudi) bail if this is triggered by the search menu item
      if (!event || !event.key || event.key === '_search') return

      setSearchTerm('')
      onSelect(event.key)
    },
    [onSelect]
  )

  const handleSearchChanged = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.currentTarget.value
    setSearchTerm(newSearchTerm)
  }, [])

  const ref: RefObject<HTMLDivElement> = useRef(null)

  useClickOutside<HTMLDivElement>(ref, () => closeMenu && closeMenu())

  const filteredData: T[] = useMemo(
    () => (searchTerm === '' ? data : data.filter((item) => filterFunction(item, searchTerm))),
    [data, filterFunction, searchTerm]
  )

  return (
    <div ref={ref}>
      <Styled.Menu onClick={handleClick}>
        {searchEnabled && (
          <Styled.Menu.Item disabled key="_search">
            <Styled.Input
              autoFocus
              value={searchTerm}
              onChange={handleSearchChanged}
              placeholder={placeholder || intl.formatMessage({ id: 'common.search' })}
              size="large"
              typevalue="ghost"
              suffix={<SearchOutlined />}
            />
          </Styled.Menu.Item>
        )}
        {filteredData.map((item: T) => {
          const { key, node } = cellRenderer(item)
          const disableItem = disableItemFilter(item)

          return (
            <Styled.MenuItem disabled={disableItem} key={key}>
              {node}
            </Styled.MenuItem>
          )
        })}
      </Styled.Menu>
    </div>
  )
}
