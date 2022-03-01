import { WalletType } from '../../../../shared/wallet/types'

export type SelectableWalletType = WalletType | 'custom'

export type WalletTypesSelectorItems = Array<{ type: SelectableWalletType; label: string }>
