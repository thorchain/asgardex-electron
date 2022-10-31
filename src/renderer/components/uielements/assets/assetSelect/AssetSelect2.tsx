import React, { useCallback, useState, useMemo, useRef } from 'react'

import { Dialog } from '@headlessui/react'
import { ArchiveBoxXMarkIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { emptyString } from '../../../../helpers/stringHelper'
import { BaseButton } from '../../button'
import { InputSearch } from '../../input'
import { AssetData } from '../assetData'

export type Props = {
  asset: Asset
  assets: Asset[]
  onSelect: (_: Asset) => void
  className?: string
  showAssetName?: boolean
  dialogHeadline?: string
  disabled?: boolean
  network: Network
}

export const AssetSelect2: React.FC<Props> = (props): JSX.Element => {
  const {
    asset,
    assets = [],
    onSelect = (_: Asset) => {},
    className = '',
    dialogHeadline = emptyString,
    showAssetName = true,
    disabled = false,
    network
  } = props

  const [openMenu, setOpenMenu] = useState<boolean>(false)

  const [searchValue, setSearchValue] = useState<string>(emptyString)

  const clearSearchValue = useCallback(() => {
    setSearchValue(emptyString)
  }, [])

  const intl = useIntl()

  const handleDropdownButtonClicked = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenMenu(!openMenu)
  }

  const handleChangeAsset = useCallback(
    async (asset: Asset) => {
      onSelect(asset)
      setOpenMenu(false)
      clearSearchValue()
    },
    [clearSearchValue, onSelect]
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
          () => (
            <div className="flex h-full w-full flex-col items-center justify-center px-20px py-50px">
              <h2 className="mb-10px text-[14px] uppercase text-gray1 dark:text-gray1d">
                {intl.formatMessage({ id: 'common.noResult' })}
              </h2>
              <ArchiveBoxXMarkIcon className="h-[75px] w-[75px] text-gray0 dark:text-gray0d" />
            </div>
          ),
          (assets) => (
            <div className="w-full overflow-y-auto">
              {FP.pipe(
                assets,
                NEA.map((asset) => (
                  <BaseButton
                    key={assetToString(asset)}
                    onClick={() => handleChangeAsset(asset)}
                    className="w-full !justify-start hover:bg-gray0 hover:dark:bg-gray0d">
                    <AssetData asset={asset} network={network} className="" />
                  </BaseButton>
                ))
              )}
            </div>
          )
        )
      ),
    [filteredAssets, handleChangeAsset, intl, network]
  )

  const searchHandler = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = target
    setSearchValue(value.replace(/\s/g, ''))
  }, [])

  const onCloseMenu = useCallback(() => {
    setOpenMenu(false)
    clearSearchValue()
  }, [clearSearchValue])

  // Ref to `InputSearch` - needed for intial focus in dialog
  // @see https://headlessui.com/react/dialog#managing-initial-focus
  const inputSearchRef = useRef(null)

  const renderMenu = useMemo(
    () => (
      <Dialog as="div" className="relative z-10" initialFocus={inputSearchRef} open={openMenu} onClose={onCloseMenu}>
        {/* backdrop */}
        <div className="fixed inset-0 bg-bg0/80 dark:bg-bg0d/80" aria-hidden="true" />

        {/* container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* dialog panel  */}
          <Dialog.Panel
            className="relative mx-auto flex h-[50%] min-h-[350px] max-w-[250px]
          flex-col items-center rounded-[10px]
           bg-bg0 px-20px
           pb-20px pt-30px shadow-lg dark:bg-bg0d
            ">
            <BaseButton
              className="absolute right-[15px] top-10px !p-0 text-gray1 hover:text-gray2 dark:text-gray1d hover:dark:text-gray2d"
              onClick={() => setOpenMenu(false)}>
              <XMarkIcon className="h-20px w-20px text-inherit" />
            </BaseButton>
            {dialogHeadline && (
              <h1 className="!my-5px text-center font-mainSemiBold text-[17px] uppercase text-text2 dark:text-text2d">
                {dialogHeadline}
              </h1>
            )}
            <InputSearch
              ref={inputSearchRef}
              className="my-10px"
              size="large"
              onChange={searchHandler}
              onCancel={clearSearchValue}
              placeholder={intl.formatMessage({ id: 'common.search' })}
            />
            {renderAssets}
          </Dialog.Panel>
        </div>
      </Dialog>
    ),
    [openMenu, onCloseMenu, dialogHeadline, searchHandler, clearSearchValue, intl, renderAssets]
  )

  const hideButton = !assets.length
  const disableButton = disabled || hideButton

  return (
    <div>
      <BaseButton
        className={`group py-[2px] px-10px focus:outline-none  ${className}`}
        disabled={disableButton}
        onClick={handleDropdownButtonClicked}>
        <AssetData noTicker={!showAssetName} className="" asset={asset} network={network} />
        {!hideButton && (
          <ChevronDownIcon
            className={`ease h-20px w-20px text-turquoise ${openMenu ? 'rotate-180' : 'rotate-0'}
            group-hover:rotate-180
            `}
          />
        )}
      </BaseButton>
      {renderMenu}
    </div>
  )
}
