import React from 'react'

import { AssetRuneNative } from '@xchainjs/xchain-util'

import { ManageButton } from './ManageButton'

export const Default = () => <ManageButton asset={AssetRuneNative} />

export default {
  title: 'ManageButton'
}
