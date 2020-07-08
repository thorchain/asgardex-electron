import React, { useCallback, useMemo, useState } from 'react'

import { SearchOutlined } from '@ant-design/icons'
import { ClickParam } from 'antd/lib/menu'

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

// Note: To have fully support of generic types in props,
// we define FilterMenu as an "old-school" a function here.
// Arrow functions seems to have some issues with generic types for properties in React.FC.
// Based on "How to use generics in props in React in a functional component?"" https://stackoverflow.com/a/59373728/2032698
function FilterMenu<T>(props: Props<T>): JSX.Element {
  // const FilterMenu = <T extends object>(props: Props<T>): JSX.Element => {
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

  const handleClick = useCallback(
    (event: ClickParam) => {
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
