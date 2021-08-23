import React, { useState, useMemo } from 'react'

import { useCallback } from '@storybook/addons'
import { Address } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import { Input } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'

import * as Styled from './CustomAddressInput.styles'

type Props = {
  asset: Asset
  address: Address
  onClickOpenAddress: (address: Address) => void
  onChangeAddress: (address: Address) => void
  // addressValidator: (address: Address) => boolean
}
export const CustomAddressInput: React.FC<Props> = (props): JSX.Element => {
  const { address, onChangeAddress, onClickOpenAddress } = props

  const [editableAddress, setEditableAddress] = useState<O.Option<Address>>(O.none)
  const maskedRecipientAddress = useMemo(() => address.substring(0, 7) + '...' + address.slice(-3), [address])

  const renderDefault = useCallback(() => {
    return (
      <>
        <Styled.AddressCustomRecipient>
          {maskedRecipientAddress}
          <div>
            <Styled.EditAddressIcon onClick={() => setEditableAddress(O.fromNullable(address))} />
            <Styled.CopyLabel copyable={{ text: address }} />
            <Styled.AddressLinkIcon onClick={() => onClickOpenAddress(address)} />
          </div>
        </Styled.AddressCustomRecipient>
      </>
    )
  }, [address, maskedRecipientAddress, onClickOpenAddress])

  const renderEditable = useCallback(
    (editableAddress: Address) => {
      return (
        <Styled.EditableFormWrapper>
          <Input value={editableAddress} onChange={(e) => setEditableAddress(O.fromNullable(e.target.value))} />
          <Styled.ConfirmEdit
            onClick={() => {
              onChangeAddress(editableAddress)
              setEditableAddress(O.fromNullable(''))
            }}
          />
          <Styled.CancelEdit onClick={() => setEditableAddress(O.fromNullable(''))} />
        </Styled.EditableFormWrapper>
      )
    },
    [onChangeAddress]
  )

  const viewToRender = useMemo(
    () =>
      FP.pipe(
        editableAddress,
        O.map((editableAddress) => renderEditable(editableAddress)),
        O.getOrElse(() => renderDefault())
      ),
    [editableAddress, renderDefault, renderEditable]
  )

  return viewToRender
}
