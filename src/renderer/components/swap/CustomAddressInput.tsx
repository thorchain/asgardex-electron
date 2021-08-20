import React, { useState } from 'react'

import { EditOutlined, CopyOutlined, SelectOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { Input } from 'antd'

import * as Styled from './CustomAddressInput.styles'

export const CustomAddressInput = () => {
  const DEFAULT = 0
  const EDITABLE = 1
  const [state, setState] = useState(DEFAULT)

  const [recipientAddress, setRecipientAddress] = useState('tbnb1231312313123')
  const [maskedRecipientAddress] = useState('tbnb1...13123')

  const renderDefault = () => {
    return (
      <div>
        <Styled.AddressCustomRecipient>
          {maskedRecipientAddress}
          <div>
            <EditOutlined onClick={() => setState(EDITABLE)} />
            <CopyOutlined />
            <SelectOutlined />
          </div>
        </Styled.AddressCustomRecipient>
      </div>
    )
  }

  const renderEditable = () => {
    return (
      <div>
        <Input value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} />
        <CheckCircleOutlined onClick={() => setState(DEFAULT)} />
        <CloseCircleOutlined onClick={() => setState(DEFAULT)} />
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
