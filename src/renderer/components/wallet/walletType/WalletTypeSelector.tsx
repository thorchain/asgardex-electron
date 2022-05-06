import React, { useMemo } from 'react'

import { Dropdown } from 'antd'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { emptyString } from '../../../helpers/stringHelper'
import { DownIcon } from '../../icons'
import { WalletTypeLabel } from './WalletTypeLabel'
import * as Styled from './WalletTypeSelector.styles'
import { SelectableWalletType, WalletTypesSelectorItems } from './WalletTypeSelector.types'

type Props = {
  selectedWalletType: SelectableWalletType
  walletTypes: WalletTypesSelectorItems
  onChange: (walletType: SelectableWalletType) => void
  className?: string
}

export const WalletTypeSelector: React.FC<Props> = (props): JSX.Element => {
  const { walletTypes, selectedWalletType, onChange, className } = props

  const overlay = useMemo(() => {
    return (
      <Styled.Overlay>
        {walletTypes.map(({ type, label }) => (
          <Styled.OverlayLabel key={type} onClick={() => onChange(type)}>
            {label}
          </Styled.OverlayLabel>
        ))}
      </Styled.Overlay>
    )
  }, [onChange, walletTypes])

  const title = useMemo(
    () =>
      FP.pipe(
        walletTypes,
        A.findFirst(({ type }) => type === selectedWalletType),
        O.map(({ label }) => label),
        O.getOrElse(() => emptyString)
      ),
    [selectedWalletType, walletTypes]
  )

  return (
    <Dropdown overlay={overlay} trigger={['click']} placement="bottom" className={className}>
      <Styled.TitleWrapper>
        <WalletTypeLabel>{title}</WalletTypeLabel>
        <DownIcon />
      </Styled.TitleWrapper>
    </Dropdown>
  )
}
