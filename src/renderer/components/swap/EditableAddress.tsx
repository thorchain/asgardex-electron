import React, { useState, useMemo, useCallback } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import { Form, Input } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { AddressValidation } from '../../services/clients'
import { InnerForm } from '../shared/form'
import * as Styled from './EditableAddress.styles'

export type EditableAddressProps = {
  asset: Asset
  address: Address
  onClickOpenAddress: (address: Address) => void
  onChangeAddress: (address: Address) => void
  addressValidator: AddressValidation
}
export const EditableAddress = ({
  address,
  onChangeAddress,
  onClickOpenAddress,
  addressValidator
}: EditableAddressProps) => {
  const RECIPIENT_FIELD = 'recipient'
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

  const renderAddress = useMemo(() => {
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
          <Styled.AddressFormWrapper>
            <InnerForm
              form={form}
              initialValues={{
                recipient: editableAddress
              }}>
              <Form.Item rules={[{ required: true, validator: validateAddress }]} name={RECIPIENT_FIELD}>
                <Input />
              </Form.Item>
            </InnerForm>
          </Styled.AddressFormWrapper>
          <Styled.AddressEditButtonsWrapper>
            <Styled.ConfirmEdit
              onClick={() => {
                if (form.getFieldError(RECIPIENT_FIELD).length === 0) {
                  onChangeAddress(form.getFieldValue(RECIPIENT_FIELD))
                  setEditableAddress(O.none)
                }
              }}
            />
            <Styled.CancelEdit onClick={() => setEditableAddress(O.none)} />
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
        O.map(renderEditableCustomAddress),
        O.getOrElse(() => renderAddress)
      ),
    [editableAddress, renderAddress, renderEditableCustomAddress]
  )

  return renderCustomAddressInput
}
