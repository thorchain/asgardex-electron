import { Address } from '@xchainjs/xchain-client'

import { WalletType } from '../../shared/wallet/types'
import { getAssetFromNullableString } from './assetHelper'
import { sequenceSOption } from './fpHelpers'
import {
  getWalletAddressFromNullableString,
  getWalletIndexFromNullableString,
  getWalletTypeFromNullableString
} from './walletHelper'

export const getAssetWalletParams = ({
  asset,
  walletAddress,
  walletIndex,
  walletType
}: {
  asset?: string
  walletAddress?: Address
  walletType?: WalletType
  walletIndex?: string
}) => {
  const oAsset = getAssetFromNullableString(asset)
  const oWalletAddress = getWalletAddressFromNullableString(walletAddress)
  const oWalletIndex = getWalletIndexFromNullableString(walletIndex)
  const oWalletType = getWalletTypeFromNullableString(walletType)

  return sequenceSOption({
    asset: oAsset,
    walletAddress: oWalletAddress,
    walletIndex: oWalletIndex,
    walletType: oWalletType
  })
}
