import React, { useState, useMemo, useCallback } from 'react'

import { CheckCircleIcon, ArrowTopRightOnSquareIcon, PencilSquareIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { Address, Asset } from '@xchainjs/xchain-util'
import { Form, Tooltip } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../shared/api/types'
import { truncateAddress } from '../../helpers/addressHelper'
import { hiddenString } from '../../helpers/stringHelper'
import { AddressValidationAsync } from '../../services/clients'
import { InnerForm } from '../shared/form'
import { BaseButton } from '../uielements/button'
import { Input } from '../uielements/input/Input'
import { CopyLabel } from '../uielements/label'

export type EditableAddressProps = {
  asset: Asset
  address: Address
  network: Network
  onClickOpenAddress: (address: Address) => void
  onChangeAddress: (address: Address) => void
  onChangeEditableAddress: (address: Address) => void
  onChangeEditableMode: (editModeActive: boolean) => void
  addressValidator: AddressValidationAsync
  hidePrivateData: boolean
}
export const EditableAddress = ({
  asset,
  address,
  onChangeAddress,
  onChangeEditableAddress,
  onClickOpenAddress,
  onChangeEditableMode,
  addressValidator,
  network,
  hidePrivateData
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
      <div className="flex items-center overflow-hidden font-main text-[16px] normal-case text-text2 dark:text-text2d">
        <Tooltip overlayStyle={{ maxWidth: '100%', whiteSpace: 'nowrap' }} title={address}>
          <BaseButton
            className="!px-0 normal-case !text-text2 dark:!text-text2d"
            onClick={() => {
              setEditableAddress(O.fromNullable(address))
              onChangeEditableMode(true)
            }}>
            {hidePrivateData ? hiddenString : truncatedAddress}
          </BaseButton>
        </Tooltip>
        <div className="flex flex-row items-center">
          <PencilSquareIcon
            className="ml-[5px] h-[20px] w-[20px] cursor-pointer text-gray2 dark:text-gray2d"
            onClick={() => {
              setEditableAddress(O.fromNullable(address))
              onChangeEditableMode(true)
            }}
          />
          <CopyLabel className="text-gray2 dark:text-gray2d" textToCopy={address} />
          <ArrowTopRightOnSquareIcon
            className="ml-[5px] h-[20px] w-[20px] cursor-pointer text-gray2 dark:text-gray2d"
            onClick={() => onClickOpenAddress(address)}
          />
        </div>
      </div>
    )
  }, [address, hidePrivateData, truncatedAddress, onChangeEditableMode, onClickOpenAddress])

  const renderEditableAddress = useCallback(
    (editableAddress: Address) => {
      return (
        // `items-start` is needed to postion icons on top in case of error message
        <InnerForm
          className="flex w-full items-start"
          form={form}
          initialValues={{
            recipient: editableAddress
          }}>
          <Form.Item
            className="!mb-0 w-full"
            rules={[{ required: true, validator: validateAddress }]}
            name={RECIPIENT_FIELD}>
            <Input className="!text-[16px] normal-case" color="primary" onKeyUp={inputOnKeyUpHandler} />
          </Form.Item>

          <CheckCircleIcon
            className="ml-5px h-[30px] w-[30px] cursor-pointer text-turquoise"
            onClick={confirmEditHandler}
          />
          <XCircleIcon
            className="ml-5px h-[30px] w-[30px] cursor-pointer text-gray2 dark:text-gray2d"
            onClick={cancelEditHandler}
          />
        </InnerForm>
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
