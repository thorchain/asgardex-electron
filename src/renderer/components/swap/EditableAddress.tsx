import React, { useState, useMemo, useCallback } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import { Form, Input } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../shared/api/types'
import { truncateAddress } from '../../helpers/addressHelper'
import { AddressValidation } from '../../services/clients'
import { InnerForm } from '../shared/form'
import * as Styled from './EditableAddress.styles'

export type EditableAddressProps = {
  asset: Asset
  address: Address
  network: Network
  onClickOpenAddress: (address: Address) => void
  onChangeAddress: (address: Address) => void
  addressValidator: AddressValidation
}
export const EditableAddress = ({
  asset,
  address,
  onChangeAddress,
  onClickOpenAddress,
  addressValidator,
  network
}: EditableAddressProps) => {
  const RECIPIENT_FIELD = 'recipient'
  const intl = useIntl()
  const [editableAddress, setEditableAddress] = useState<O.Option<Address>>(O.none)
  const truncatedAddress = useMemo(
    () => truncateAddress(address, asset.chain, network),
    [address, asset.chain, network]
  )

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
          {truncatedAddress}
          <div>
            <Styled.EditAddressIcon onClick={() => setEditableAddress(O.fromNullable(address))} />
            <Styled.CopyLabel copyable={{ text: address }} />
            <Styled.AddressLinkIcon onClick={() => onClickOpenAddress(address)} />
          </div>
        </Styled.AddressCustomRecipient>
      </>
    )
  }, [address, truncatedAddress, onClickOpenAddress])

  const renderEditableAddress = useCallback(
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
        O.map(renderEditableAddress),
        O.getOrElse(() => renderAddress)
      ),
    [editableAddress, renderAddress, renderEditableAddress]
  )

  return renderCustomAddressInput
}
