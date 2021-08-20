import React, { useState, useMemo, useCallback } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Asset, BNBChain, Chain, THORChain } from '@xchainjs/xchain-util'
import { Input } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { useValidateAddress } from '../../hooks/useValidateAddress'
import { AddressValidation } from '../../services/clients/types'
import * as Styled from './CustomAddressInput.styles'

type Props = {
  oTargetAsset: O.Option<Asset>
  oTargetWalletAddress: O.Option<string>
  clickAddressLinkHandler: (chain: Chain, address: Address) => void
}
export const CustomAddressInput: React.FC<Props> = (props): JSX.Element => {
  const { clickAddressLinkHandler, oTargetAsset, oTargetWalletAddress } = props
  const chain = useMemo(
    () =>
      FP.pipe(
        oTargetAsset,
        O.map((asset) => asset.chain),
        O.getOrElse(() => THORChain)
      ),
    [oTargetAsset]
  )

  const [editModeActive, setEditModeActive] = useState(false)

  const [recipientAddress, setRecipientAddress] = useState('')
  const [editableRecipientAddress, setEditableRecipientAddress] = useState('')
  const maskedRecipientAddress = useMemo(
    () => recipientAddress.substring(0, 7) + '...' + recipientAddress.slice(-3),
    [recipientAddress]
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const targetAddress = useMemo(
    () =>
      FP.pipe(
        oTargetWalletAddress,
        O.map((address) => {
          setRecipientAddress(address)
          return address
        }),
        O.getOrElse(() => '')
      ),
    [oTargetWalletAddress]
  )

  const addressValidation: AddressValidation = useValidateAddress(BNBChain)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addressValidator = useCallback(
    async (_: unknown, value: string) => {
      if (!value) {
        return Promise.reject('empty')
      }
      if (!addressValidation(value.toLowerCase())) {
        return Promise.reject('invalid')
      }
    },
    [addressValidation]
  )

  const activateEditing = () => {
    setEditableRecipientAddress(recipientAddress)
    setEditModeActive(true)
  }

  const saveCustomAddress = () => {
    setRecipientAddress(editableRecipientAddress)
    setEditModeActive(false)
  }

  const cancelEditCustomAddress = () => {
    setEditableRecipientAddress(recipientAddress)
    setEditModeActive(false)
  }

  const renderDefault = () => {
    return (
      <>
        <Styled.AddressCustomRecipient>
          {maskedRecipientAddress}
          <div>
            <Styled.EditAddressIcon onClick={() => activateEditing()} />
            <Styled.CopyLabel copyable={{ text: recipientAddress }} />
            <Styled.AddressLinkIcon onClick={() => clickAddressLinkHandler(chain, recipientAddress)} />
          </div>
        </Styled.AddressCustomRecipient>
      </>
    )
  }

  const renderEditable = () => {
    return (
      <Styled.EditableFormWrapper>
        <Input value={editableRecipientAddress} onChange={(e) => setEditableRecipientAddress(e.target.value)} />
        <Styled.ConfirmEdit style={{ margin: 5 }} onClick={saveCustomAddress} />
        <Styled.CancelEdit style={{ margin: 5 }} onClick={cancelEditCustomAddress} />
      </Styled.EditableFormWrapper>
    )
  }

  return <>{editModeActive ? renderEditable() : renderDefault()}</>
}
