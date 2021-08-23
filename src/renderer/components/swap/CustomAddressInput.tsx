import React, { useState, useMemo, useCallback } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import { Form, Input } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import * as Styled from './CustomAddressInput.styles'

type Props = {
  asset: Asset
  address: Address
  onClickOpenAddress: (address: Address) => void
  onChangeAddress: (address: Address) => void
  addressValidator: (address: Address) => boolean
}
export const CustomAddressInput: React.FC<Props> = (props): JSX.Element => {
  const { address, onChangeAddress, onClickOpenAddress, addressValidator } = props

  const intl = useIntl()
  const [editableAddress, setEditableAddress] = useState<O.Option<Address>>(O.none)
  const maskedRecipientAddress = useMemo(() => address.substring(0, 7) + '...' + address.slice(-3), [address])

  const validateAddress = useCallback(
    async (_: unknown, value: string) => {
      if (!value) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.errors.address.empty' }))
      }
      if (!addressValidator(value)) {
        console.log(value)
        return Promise.reject(intl.formatMessage({ id: 'wallet.errors.address.invalid' }))
      }
    },
    [addressValidator, intl]
  )

  const [form] = Form.useForm<{ recipient: string }>()

  const renderCustomAddress = useCallback(() => {
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

  const renderEditableCustomAddress = useCallback(
    (editableAddress: Address) => {
      return (
        <Styled.EditableFormWrapper>
          <Styled.Form
            form={form}
            initialValues={{
              recipient: editableAddress
            }}>
            <Form.Item rules={[{ required: true, validator: validateAddress }]} name="recipient">
              <Input />
            </Form.Item>
            <Styled.ConfirmEdit
              onClick={() => {
                onChangeAddress(editableAddress)
                setEditableAddress(O.fromNullable(null))
              }}
            />
            <Styled.CancelEdit onClick={() => setEditableAddress(O.fromNullable(null))} />
          </Styled.Form>
        </Styled.EditableFormWrapper>
      )
    },
    [form, onChangeAddress, validateAddress]
  )

  const renderCustomAddressInput = useMemo(
    () =>
      FP.pipe(
        editableAddress,
        O.map((editableAddress) => renderEditableCustomAddress(editableAddress)),
        O.getOrElse(() => renderCustomAddress())
      ),
    [editableAddress, renderCustomAddress, renderEditableCustomAddress]
  )

  return renderCustomAddressInput
}
