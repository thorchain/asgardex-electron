import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { WalletType } from '../../../../../shared/wallet/types'
import { getWalletByAddress } from '../../../../helpers/walletHelper'
import { WalletBalances } from '../../../../services/clients'
import { WalletTypeLabel } from '../../../uielements/common/Common.styles'
import * as Styled from '../TxForm.styles'

export const renderedWalletType = (oMatchedWalletType: O.Option<WalletType>) =>
  FP.pipe(
    oMatchedWalletType,
    O.fold(
      () => <></>,
      (matchedWalletType) => (
        <Styled.WalletTypeLabelWrapper>
          <WalletTypeLabel>{matchedWalletType}</WalletTypeLabel>
        </Styled.WalletTypeLabelWrapper>
      )
    )
  )

export const matchedWalletType = (balances: WalletBalances, recipientAddress: string): O.Option<WalletType> =>
  FP.pipe(
    getWalletByAddress(balances, recipientAddress),
    O.map(({ walletType }) => walletType)
  )
