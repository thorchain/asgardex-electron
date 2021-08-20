import React, { useState, useMemo } from 'react'

import { EditOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { Address } from '@xchainjs/xchain-client'
import { Asset, Chain, THORChain } from '@xchainjs/xchain-util'
import { Input } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import * as Styled from './CustomAddressInput.styles'

type Props = {
  oTargetAsset: O.Option<Asset>
  clickAddressLinkHandler: (chain: Chain, address: Address) => void
}

export const CustomAddressInput: React.FC<Props> = (props): JSX.Element => {
  const { clickAddressLinkHandler, oTargetAsset } = props

  const chain = useMemo(
    () =>
      FP.pipe(
        oTargetAsset,
        O.map((asset) => asset.chain),
        O.getOrElse(() => THORChain)
      ),
    [oTargetAsset]
  )

  const DEFAULT = 0
  const EDITABLE = 1
  const [state, setState] = useState(DEFAULT)

  const [recipientAddress, setRecipientAddress] = useState('tbnb1231312313113212323')
  const [editableRecipientAddress, setEditableRecipientAddress] = useState(recipientAddress)
  const maskedRecipientAddress = useMemo(
    () => recipientAddress.substring(0, 7) + '...' + recipientAddress.slice(-3),
    [recipientAddress]
  )

  const saveCustomAddress = () => {
    setRecipientAddress(editableRecipientAddress)
    setState(DEFAULT)
  }

  const cancelEditCustomAddress = () => {
    setEditableRecipientAddress(recipientAddress)
    setState(DEFAULT)
  }

  const renderDefault = () => {
    return (
      <div>
        <Styled.AddressCustomRecipient>
          {maskedRecipientAddress}
          <div>
            <EditOutlined onClick={() => setState(EDITABLE)} />
            <Styled.CopyLabel copyable={{ text: recipientAddress }} />
            <Styled.AddressLinkIcon onClick={() => clickAddressLinkHandler(chain, recipientAddress)} />
          </div>
        </Styled.AddressCustomRecipient>
      </div>
    )
  }

  const renderEditable = () => {
    return (
      <div>
        <Input value={editableRecipientAddress} onChange={(e) => setEditableRecipientAddress(e.target.value)} />
        <CheckCircleOutlined onClick={saveCustomAddress} />
        <CloseCircleOutlined onClick={cancelEditCustomAddress} />
      </div>
    )
  }

  return (
    <>
      {state === DEFAULT && renderDefault()}
      {state === EDITABLE && renderEditable()}
    </>
  )
}
