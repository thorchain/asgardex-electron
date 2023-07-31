import React, { useCallback, useState, useMemo, useRef, Fragment } from 'react'

import { Dialog, Transition } from '@headlessui/react'
import { ArchiveBoxXMarkIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { eqAsset } from '../../../../helpers/fp/eq'
import { emptyString } from '../../../../helpers/stringHelper'
import { BaseButton } from '../../button'
import { InputSearch } from '../../input'
import { AssetData } from '../assetData'

export type Props = {
  asset: Asset
  assets: Asset[]
  onSelect: (_: Asset) => void
  open: boolean
  onClose: FP.Lazy<void>
  className?: string
  headline?: string
  network: Network
}

export const AssetMenu: React.FC<Props> = (props): JSX.Element => {
  const {
    asset,
    open,
    assets = [],
    onSelect = (_: Asset) => {},
    headline = emptyString,
    network,
    onClose,
    className = ''
  } = props

  const [searchValue, setSearchValue] = useState<string>(emptyString)

  const clearSearchValue = useCallback(() => {
    setSearchValue(emptyString)
  }, [])

  const intl = useIntl()

  const handleChangeAsset = useCallback(
    async (asset: Asset) => {
      onSelect(asset)
      clearSearchValue()
    },
    [clearSearchValue, onSelect]
  )

  const filteredAssets = useMemo(
    () =>
      FP.pipe(
        assets,
        A.filter((asset) =>
          searchValue
            ? searchValue.toLowerCase() === 'synth?'
              ? asset.synth
              : assetToString(asset).toLowerCase().includes(searchValue.toLowerCase())
            : true
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
              <ArchiveBoxXMarkIcon className="h-[75px] w-[75px] text-gray0 dark:text-gray0d" />
              <h2 className="mb-10px text-[14px] uppercase text-gray1 dark:text-gray1d">
                {intl.formatMessage({ id: 'common.noResult' })}
              </h2>
            </div>
          ),
          (assets) => (
            <div className="w-full overflow-y-auto">
              {FP.pipe(
                assets,
                NEA.map((assetInList) => {
                  const selected = eqAsset.equals(asset, assetInList)
                  return (
                    <BaseButton
                      className={`w-full !justify-between !pr-20px
                        hover:bg-gray0 hover:dark:bg-gray0d`}
                      key={assetToString(assetInList)}
                      onClick={() => handleChangeAsset(assetInList)}
                      disabled={selected}>
                      <AssetData asset={assetInList} network={network} className="" />
                      {selected && <CheckIcon className="h-20px w-20px  text-turquoise" />}
                    </BaseButton>
                  )
                })
              )}
            </div>
          )
        )
      ),
    [asset, filteredAssets, handleChangeAsset, intl, network]
  )

  const searchHandler = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = target
    setSearchValue(value.replace(/\s/g, ''))
  }, [])

  const onEnterHandler = useCallback(() => {
    if (filteredAssets.length === 1) {
      // select first asset
      handleChangeAsset(filteredAssets[0])
    }
  }, [filteredAssets, handleChangeAsset])

  const onCloseMenu = useCallback(() => {
    clearSearchValue()
    onClose()
  }, [clearSearchValue, onClose])

  // Ref to `InputSearch` - needed for intial focus in dialog
  // @see https://headlessui.com/react/dialog#managing-initial-focus
  const inputSearchRef = useRef(null)

  return (
    <Dialog
      as="div"
      className={`relative z-10 ${className}`}
      initialFocus={inputSearchRef}
      open={open}
      onClose={onCloseMenu}>
      <Transition appear show={open} as="div">
        {/* backdrop animated */}
        <Transition.Child
          enter="ease"
          enterFrom="opacity-0"
          enterTo="opacity-70"
          leave="ease"
          leaveFrom="opacity-70"
          leaveTo="opacity-0">
          <div className="ease fixed inset-0 bg-bg0 dark:bg-bg0d" aria-hidden="true" />
        </Transition.Child>

        {/* container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* dialog panel animated  */}
          <Transition.Child
            as={Fragment}
            enter="ease"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95">
            <Dialog.Panel
              className="relative mx-auto flex h-[75%] max-h-[500px] min-h-[350px] max-w-[250px] flex-col
        items-center bg-bg0
         p-20px shadow-full dark:bg-bg0d dark:shadow-fulld md:max-w-[350px] md:p-40px
          ">
              <BaseButton
                className="absolute right-20px top-20px !p-0 text-gray1 hover:text-gray2 dark:text-gray1d hover:dark:text-gray2d"
                onClick={() => onClose()}>
                <XMarkIcon className="h-20px w-20px text-inherit" />
              </BaseButton>
              {headline && (
                <h1 className="my-0 px-5px text-center font-mainSemiBold text-[16px] uppercase text-text2 dark:text-text2d">
                  {headline}
                </h1>
              )}
              <InputSearch
                ref={inputSearchRef}
                className="my-10px"
                size="normal"
                onChange={searchHandler}
                onCancel={clearSearchValue}
                onEnter={onEnterHandler}
                placeholder={intl.formatMessage({ id: 'common.search' })}
              />
              {renderAssets}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Transition>
    </Dialog>
  )
}
