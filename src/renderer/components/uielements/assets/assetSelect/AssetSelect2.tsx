import React, { useCallback, useState, useMemo } from 'react'

import { Dialog } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { emptyString } from '../../../../helpers/stringHelper'
import { BaseButton } from '../../button'
import { Input } from '../../input/Input'
import { AssetData } from '../assetData'

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

export const AssetSelect2: React.FC<Props> = (props): JSX.Element => {
  const {
    asset,
    assets = [],
    // withSearch = true,
    // searchDisable = [],
    onSelect = (_: Asset) => {},
    className,
    showAssetName = true,
    disabled = false,
    network
  } = props

  const [openMenu, setOpenMenu] = useState<boolean>(false)

  const [searchValue, setSearchValue] = useState<string>(emptyString)

  const _intl = useIntl()

  const handleDropdownButtonClicked = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenMenu(!openMenu)
  }

  const handleChangeAsset = useCallback(
    async (asset: Asset) => {
      onSelect(asset)
      setOpenMenu(false)
    },
    [onSelect]
  )

  const filteredAssets = useMemo(
    () =>
      FP.pipe(
        assets,
        A.filter((asset) =>
          // filter assets depending on search input
          searchValue ? assetToString(asset).toLowerCase().includes(searchValue.toLowerCase()) : true
        )
      ),
    [assets, searchValue]
  )
  const renderAssets = useMemo(
    () =>
      FP.pipe(
        filteredAssets,
        NEA.fromArray,
        O.fold(
          () => <>no result</>,
          (assets) => (
            <>
              {FP.pipe(
                assets,
                NEA.map((asset) => (
                  <BaseButton
                    key={assetToString(asset)}
                    onClick={() => handleChangeAsset(asset)}
                    className="w-full !justify-start px-[30px] hover:bg-gray0 hover:dark:bg-gray0d">
                    <AssetData asset={asset} network={network} className="" />
                  </BaseButton>
                ))
              )}
            </>
          )
        )
      ),
    [filteredAssets, handleChangeAsset, network]
  )

  const searchHandler = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = target
    setSearchValue(value)
  }, [])

  const renderMenu = useMemo(
    () => (
      <Dialog as="div" className="relative z-10" open={openMenu} onClose={() => setOpenMenu(false)}>
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* The actual dialog panel  */}
          <Dialog.Panel className="mx-auto max-h-[90%] max-w-sm overflow-y-scroll rounded-[10px] bg-white py-10px shadow-lg">
            <Input size="normal" onChange={searchHandler} />
            {renderAssets}
          </Dialog.Panel>
        </div>
      </Dialog>
    ),
    [openMenu, renderAssets, searchHandler]
  )

  const hideButton = !assets.length
  const disableButton = disabled || hideButton

  return (
    <div>
      <BaseButton
        className={`group py-[2px] px-10px ${className}`}
        disabled={disableButton}
        onClick={handleDropdownButtonClicked}>
        <AssetData noTicker={!showAssetName} className="" asset={asset} network={network} />
        {!hideButton && (
          <ChevronDownIcon
            className={`ease h-20px w-20px text-turquoise ${
              openMenu ? 'rotate-180' : 'rotate-0'
            } group-hover:rotate-180`}
          />
        )}
      </BaseButton>
      {renderMenu}
    </div>
  )
}
