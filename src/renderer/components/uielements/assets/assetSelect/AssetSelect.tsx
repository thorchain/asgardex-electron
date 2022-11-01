import React, { useCallback, useState } from 'react'

import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { Asset } from '@xchainjs/xchain-util'

import { Network } from '../../../../../shared/api/types'
import { emptyString } from '../../../../helpers/stringHelper'
import { BaseButton } from '../../button'
import { AssetData } from '../assetData'
import { AssetMenu } from '../assetMenu'

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

export const AssetSelect: React.FC<Props> = (props): JSX.Element => {
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

  const buttonClickHandler = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenMenu(true)
  }, [])

  const handleChangeAsset = useCallback(
    async (asset: Asset) => {
      onSelect(asset)
      setOpenMenu(false)
    },
    [onSelect]
  )

  const hideButton = !assets.length
  const disableButton = disabled || hideButton

  return (
    <div>
      <AssetMenu
        asset={asset}
        assets={assets}
        onSelect={handleChangeAsset}
        open={openMenu}
        onClose={() => setOpenMenu(false)}
        headline={dialogHeadline}
        network={network}
      />
      <BaseButton
        className={`group py-[2px] px-10px ${
          !disableButton ? 'hover:shadow-full dark:shadow-fulld' : ''
        } focus:outline-none ${className}`}
        disabled={disableButton}
        onClick={buttonClickHandler}>
        <AssetData noTicker={!showAssetName} className="" asset={asset} network={network} />
        {!hideButton && (
          <ChevronDownIcon
            className={`ease h-20px w-20px text-turquoise ${openMenu ? 'rotate-180' : 'rotate-0'}
            group-hover:rotate-180
            `}
          />
        )}
      </BaseButton>
    </div>
  )
}
