import React from 'react'

import { storiesOf } from '@storybook/react'
import { AssetBNB } from '@xchainjs/xchain-util'

import { BNB_ADDRESS_TESTNET } from '../../../../shared/mock/address'
import { QRCodeModal as Modal } from './QRCodeModal'

storiesOf('Components/Modal', module).add('default', () => {
  return <Modal asset={AssetBNB} address={BNB_ADDRESS_TESTNET} network="testnet" visible />
})
