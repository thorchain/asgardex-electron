import React, { useState, useMemo, useCallback } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import { Form, Tooltip } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../shared/api/types'
import { truncateAddress } from '../../helpers/addressHelper'
import { AddressValidationAsync } from '../../services/clients'
import * as Styled from './EditableAddress.styles'

export type EditableAddressProps = {
  asset: Asset
  address: Address
  network: Network
  onClickOpenAddress: (address: Address) => void
  onChangeAddress: (address: Address) => void
  onChangeEditableAddress: (address: Address) => void
  onChangeEditableMode: (editModeActive: boolean) => void
  addressValidator: AddressValidationAsync
}
export const EditableAddress = ({
  asset,
  address,
  onChangeAddress,
  onChangeEditableAddress,
  onClickOpenAddress,
  onChangeEditableMode,
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
      const valid = await addressValidator(value)
      if (!valid) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.errors.address.invalid' }))
      }
    },
    [addressValidator, intl]
  )

  const [form] = Form.useForm<{ recipient: string }>()

  const confirmEditHandler = useCallback(() => {
    if (form.getFieldError(RECIPIENT_FIELD).length === 0) {
      onChangeAddress(form.getFieldValue(RECIPIENT_FIELD))
      onChangeEditableAddress(form.getFieldValue(RECIPIENT_FIELD))
      form.resetFields()
      setEditableAddress(O.none)
      onChangeEditableMode(false)
    }
  }, [form, onChangeAddress, onChangeEditableAddress, onChangeEditableMode])

  const cancelEditHandler = useCallback(() => {
    form.resetFields()
    onChangeEditableAddress(address)
    setEditableAddress(O.none)
    onChangeEditableMode(false)
  }, [address, form, onChangeEditableAddress, onChangeEditableMode])

  const inputOnKeyUpHandler = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      // Call callback before handling key - in other case result will be lost
      onChangeEditableAddress(form.getFieldValue(RECIPIENT_FIELD))

      if (e.key === 'Enter') {
        confirmEditHandler()
      }
      if (e.key === 'Escape') {
        cancelEditHandler()
      }
    },
    [cancelEditHandler, confirmEditHandler, form, onChangeEditableAddress]
  )

  const renderAddress = useMemo(() => {
    return (
      <Styled.AddressCustomRecipient>
        <Tooltip overlayStyle={{ maxWidth: '100%', whiteSpace: 'nowrap' }} title={address}>
          {truncatedAddress}
        </Tooltip>
        <div>
          <Styled.EditAddressIcon
            onClick={() => {
              setEditableAddress(O.fromNullable(address))
              onChangeEditableMode(true)
            }}
          />
          <Styled.CopyLabel copyable={{ text: address }} />
          <Styled.AddressLinkIcon onClick={() => onClickOpenAddress(address)} />
        </div>
      </Styled.AddressCustomRecipient>
    )
  }, [address, truncatedAddress, onChangeEditableMode, onClickOpenAddress])

  const renderEditableAddress = useCallback(
    (editableAddress: Address) => {
      return (
        <Styled.EditableFormWrapper>
          <Styled.InnerForm
            form={form}
            initialValues={{
              recipient: editableAddress
            }}>
            <Form.Item rules={[{ required: true, validator: validateAddress }]} name={RECIPIENT_FIELD}>
              <Styled.Input color="primary" onKeyUp={inputOnKeyUpHandler} />
            </Form.Item>
          </Styled.InnerForm>
          <Styled.AddressEditButtonsWrapper>
            <Styled.ConfirmEdit onClick={confirmEditHandler} />
            <Styled.CancelEdit onClick={cancelEditHandler} />
          </Styled.AddressEditButtonsWrapper>
        </Styled.EditableFormWrapper>
      )
    },
    [cancelEditHandler, confirmEditHandler, form, inputOnKeyUpHandler, validateAddress]
  )

  const renderCustomAddressInput = useCallback(
    () =>
      FP.pipe(
        editableAddress,
        O.map((address) => renderEditableAddress(address)),
        O.getOrElse(() => renderAddress)
      ),
    [editableAddress, renderAddress, renderEditableAddress]
  )

  return renderCustomAddressInput()
}
