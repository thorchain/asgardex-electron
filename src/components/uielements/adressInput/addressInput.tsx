import React, { useState, useEffect } from 'react'

import { PlusOutlined, DeleteFilled } from '@ant-design/icons'

import Input from '../input'
import { AddressInputWrapper, PopoverContainer, PopoverContent } from './addressInput.style'

type Props = {
  value?: string
  status?: boolean
  onChange: (address: string) => void
  onStatusChange: (status: boolean) => void
  className?: string
}

const AddressInput: React.FC<Props> = (props: Props): JSX.Element => {
  const { value = '', status: initialStatus = false, onStatusChange, onChange, className = '', ...otherProps } = props

  const [status, setStatus] = useState(initialStatus)

  useEffect(() => {
    onStatusChange(status)
  }, [onStatusChange, status])

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target?.value ?? ''
    onChange(value)
  }

  const onClickWrapper = (_: React.MouseEvent<HTMLDivElement>) => {
    if (!status) {
      setStatus(true)
    }
  }

  const getPopupContainer = () => {
    return document.getElementsByClassName('addressInput-wrapper')[0] as HTMLElement
  }

  const renderPopoverContent = () => {
    return <PopoverContent>Add Recipient Address</PopoverContent>
  }

  return (
    <AddressInputWrapper
      status={status}
      className={`addressInput-wrapper ${className}`}
      onClick={onClickWrapper}
      data-test="add-recipient-address-button"
      {...otherProps}>
      {!status && (
        <PopoverContainer
          getPopupContainer={getPopupContainer}
          content={renderPopoverContent()}
          placement="right"
          visible
          overlayClassName="addressInput-popover"
          overlayStyle={{
            animationDuration: '0s !important',
            animation: 'none !important'
          }}>
          <div className="addressInput-icon" data-test="add-recipient-address-button">
            <PlusOutlined />
          </div>
        </PopoverContainer>
      )}
      {status && (
        <>
          <div className="addressInput-icon" onClick={(_) => setStatus(false)}>
            <DeleteFilled />
          </div>
          <Input
            className="address-input"
            color="success"
            sizevalue="normal"
            value={value}
            onChange={onChangeHandler}
            placeholder="Enter Recipient Address"
            data-test="recipient-address-field"
          />
        </>
      )}
    </AddressInputWrapper>
  )
}

export default AddressInput
