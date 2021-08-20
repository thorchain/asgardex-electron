import React, { useState, useMemo } from 'react'

import { EditOutlined, CopyOutlined, SelectOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { Input } from 'antd'

import * as Styled from './CustomAddressInput.styles'

export const CustomAddressInput = () => {
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
            <CopyOutlined onClick={() => navigator.clipboard.writeText('Copy this text to clipboard')} />
            <SelectOutlined />
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
