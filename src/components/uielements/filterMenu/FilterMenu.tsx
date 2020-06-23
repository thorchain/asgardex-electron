import React, { useCallback, useMemo, useState } from 'react'

import { SearchOutlined } from '@ant-design/icons'
import { ClickParam } from 'antd/lib/menu'

import { AssetPair } from '../../../types/asgardex'
import Input from '../input'
import { Menu, MenuItem } from './FilterMenu.style'

type Props = {
  asset?: string
  data: AssetPair[]
  placeholder?: string
  searchEnabled?: boolean
  cellRenderer: (data: AssetPair) => { key: string; node: JSX.Element }
  disableItemFilter?: (item: AssetPair) => boolean
  filterFunction: (item: AssetPair, searchTerm: string) => boolean
  onSelect?: (value: string) => void
}

const FilterMenu: React.FC<Props> = ({
  onSelect = (_) => {},
  searchEnabled = false,
  data,
  filterFunction,
  cellRenderer,
  disableItemFilter = (_) => false,
  placeholder = 'Search Token ...'
}): JSX.Element => {
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

  const filteredData: AssetPair[] = useMemo(
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
            sizevalue="big"
            typevalue="ghost"
            suffix={<SearchOutlined />}
          />
        </Menu.Item>
      )}
      {filteredData.map((item: AssetPair) => {
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
