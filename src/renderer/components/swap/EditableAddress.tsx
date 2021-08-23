import React, { useState, useMemo, useCallback } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import { Form, Input } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { InnerForm } from '../shared/form'
import * as Styled from './EditableAddress.styles'

export type EditableAddressProps = {
  asset: Asset
  address: Address
  onClickOpenAddress: (address: Address) => void
  onChangeAddress: (address: Address) => void
  addressValidator: (address: Address) => boolean
}
export const EditableAddress = ({
  address,
  onChangeAddress,
  onClickOpenAddress,
  addressValidator
}: EditableAddressProps) => {
  const intl = useIntl()
  const [editableAddress, setEditableAddress] = useState<O.Option<Address>>(O.none)
  const maskedRecipientAddress = useMemo(() => address.substring(0, 7) + '...' + address.slice(-3), [address])

  const validateAddress = useCallback(
    async (_: unknown, value: string) => {
      if (!value) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.errors.address.empty' }))
      }
      if (!addressValidator(value)) {
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
          <Styled.AddressFormWrapper style={{ marginTop: '20px', flex: 7 }}>
            <InnerForm
              form={form}
              initialValues={{
                recipient: editableAddress
              }}>
              <Form.Item rules={[{ required: true, validator: validateAddress }]} name="recipient">
                <Input />
              </Form.Item>
            </InnerForm>
          </Styled.AddressFormWrapper>
          <Styled.AddressEditButtonsWrapper style={{ flex: 3 }}>
            <Styled.ConfirmEdit
              onClick={() => {
                onChangeAddress(editableAddress)
                setEditableAddress(O.fromNullable(null))
              }}
            />
            <Styled.CancelEdit onClick={() => setEditableAddress(O.fromNullable(null))} />
          </Styled.AddressEditButtonsWrapper>
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
