import React, { useCallback, useState, useMemo } from 'react'

import { delay, Asset } from '@xchainjs/xchain-util'
import { Dropdown } from 'antd'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { eqAsset } from '../../../../helpers/fp/eq'
import { ordAsset } from '../../../../helpers/fp/ord'
import { DownIcon } from '../../../icons'
import { AssetData } from '../assetData'
import { AssetMenu } from '../assetMenu'
import * as Styled from './AssetSelect.styles'

export type Props = {
  asset: Asset
  assets: Asset[]
  withSearch?: boolean
  searchDisable?: string[]
  onSelect: (_: Asset) => void
  className?: string
  showAssetName?: boolean
  disabled?: boolean
  network: Network
}

export const AssetSelect: React.FC<Props> = (props): JSX.Element => {
  const {
    asset,
    assets = [],
    withSearch = true,
    searchDisable = [],
    onSelect = (_: Asset) => {},
    className,
    showAssetName = true,
    disabled = false,
    network
  } = props

  const [openDropdown, setOpenDropdown] = useState<boolean>(false)
  const intl = useIntl()

  const closeMenu = useCallback(() => {
    openDropdown && setOpenDropdown(false)
  }, [setOpenDropdown, openDropdown])

  const handleDropdownButtonClicked = (e: React.MouseEvent) => {
    e.stopPropagation()
    // toggle dropdown state
    setOpenDropdown(!openDropdown)
  }

  const handleChangeAsset = useCallback(
    async (asset: Asset) => {
      setOpenDropdown(false)

      // Wait for the dropdown to close
      await delay(500)

      FP.pipe(
        assets,
        A.findFirst((assetToFilter) => eqAsset.equals(assetToFilter, asset)),
        O.map((asset) => {
          onSelect(asset)
          return true
        }),
        O.getOrElse(() => false)
      )
    },
    [assets, onSelect]
  )

  const renderMenu = useMemo(() => {
    const sortedAssets = assets.sort(ordAsset.compare)
    return (
      <Styled.AssetSelectMenuWrapper>
        <AssetMenu
          searchPlaceholder={intl.formatMessage({ id: 'common.search' })}
          closeMenu={closeMenu}
          assets={sortedAssets}
          asset={asset}
          withSearch={withSearch}
          searchDisable={searchDisable}
          onSelect={handleChangeAsset}
          network={network}
        />
      </Styled.AssetSelectMenuWrapper>
    )
  }, [assets, intl, closeMenu, asset, withSearch, searchDisable, handleChangeAsset, network])

  return (
    <Styled.AssetSelectWrapper
      className={`${className} ${openDropdown ? 'selected' : ''}`}
      disabled={disabled}
      onClick={handleDropdownButtonClicked}>
      <Dropdown overlay={renderMenu} trigger={[]} visible={openDropdown} placement="bottom">
        <div className="group flex items-center">
          <AssetData noTicker={!showAssetName} className={'asset-data'} asset={asset} network={network} />
          <Styled.AssetDropdownButton>
            <DownIcon
              className={`
                scale-150
                  ${disabled ? 'opacity-50' : 'opacity-100'}
                ${openDropdown ? 'rotate-180' : 'rotate-0'}
                transition
                duration-200
                ease-in-out
                group-hover:rotate-180
                `}
            />
          </Styled.AssetDropdownButton>
        </div>
      </Dropdown>
    </Styled.AssetSelectWrapper>
  )
}
