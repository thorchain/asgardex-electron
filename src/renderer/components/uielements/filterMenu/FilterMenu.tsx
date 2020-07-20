import React, { useCallback, useMemo, useState } from 'react'

import { SearchOutlined } from '@ant-design/icons'
import { MenuProps } from 'antd/lib/menu'

import { Input } from '../input'
import { Menu, MenuItem } from './FilterMenu.style'

type Props<T> = {
  asset?: string
  data: T[]
  placeholder?: string
  searchEnabled?: boolean
  cellRenderer: (data: T) => { key: string; node: JSX.Element }
  disableItemFilter?: (item: T) => boolean
  filterFunction: (item: T, searchTerm: string) => boolean
  onSelect?: (value: string) => void
}

const FilterMenu = <T extends unknown>(props: Props<T>): JSX.Element => {
  const {
    onSelect = (_) => {},
    searchEnabled = false,
    data,
    filterFunction,
    cellRenderer,
    disableItemFilter = (_) => false,
    placeholder = 'Search Token ...'
  } = props

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

  const filteredData: T[] = useMemo(
    () => (searchTerm === '' ? data : data.filter((item) => filterFunction(item, searchTerm))),
    [data, filterFunction, searchTerm]
  )

  return (
    <Menu onClick={handleClick}>
      {searchEnabled && (
        <Menu.Item disabled key="_search">
          <Input
            value={searchTerm}
            onChange={handleSearchChanged}
            placeholder={placeholder}
            size="large"
            typevalue="ghost"
            suffix={<SearchOutlined />}
          />
        </Menu.Item>
      )}
      {filteredData.map((item: T) => {
        const { key, node } = cellRenderer(item)
        const disableItem = disableItemFilter(item)

        return (
          <MenuItem disabled={disableItem} key={key}>
            {node}
          </MenuItem>
        )
      })}
    </Menu>
  )
}

export default FilterMenu
