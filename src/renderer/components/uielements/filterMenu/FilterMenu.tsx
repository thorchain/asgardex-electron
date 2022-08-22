import React, { RefObject, useCallback, useMemo, useRef, useState } from 'react'

import { SearchOutlined } from '@ant-design/icons'
import { MenuProps } from 'antd/lib/menu'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { useClickOutside } from '../../../hooks/useOutsideClick'
import * as Styled from './FilterMenu.styles'

export type Props<T> = {
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
    ({ key }: { key: string }) => {
      // (Rudi) bail if this is triggered by the search menu item
      if (!key || key === '_search') return

      setSearchTerm('')
      onSelect(key)
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

  const items: ItemType[] = useMemo(() => {
    const searchInput: ItemType[] = searchEnabled
      ? [
          {
            label: (
              <Styled.Input
                autoFocus
                value={searchTerm}
                onChange={handleSearchChanged}
                placeholder={(placeholder || intl.formatMessage({ id: 'common.search' })).toUpperCase()}
                size="large"
                typevalue="ghost"
                suffix={<SearchOutlined />}
              />
            ),
            disabled: true,
            key: '_search'
          }
        ]
      : []

    const filteredItems: ItemType[] = FP.pipe(
      filteredData,
      A.map<T, ItemType>((item: T) => {
        const { key, node } = cellRenderer(item)
        const disableItem = disableItemFilter(item)

        return {
          label: node,
          disabled: disableItem,
          key
        }
      })
    )

    return [...searchInput, ...filteredItems]
  }, [cellRenderer, disableItemFilter, filteredData, handleSearchChanged, intl, placeholder, searchEnabled, searchTerm])

  return (
    <div ref={ref}>
      <Styled.Menu onClick={handleClick} items={items} />
    </div>
  )
}
