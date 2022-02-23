import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { IntlShape } from 'react-intl'

import { WalletType } from '../../../../shared/wallet/types'
import { emptyString } from '../../../helpers/stringHelper'
import { getWalletByAddress } from '../../../helpers/walletHelper'
import { WalletBalances } from '../../../services/clients'
import { TxHashRD } from '../../../services/wallet/types'
import { WalletTypeLabel } from '../../uielements/common/Common.styles'
import * as Styled from './TxForm.styles'

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

export const matchedWalletType = (balances: WalletBalances, recipientAddress: Address): O.Option<WalletType> =>
  FP.pipe(
    getWalletByAddress(balances, recipientAddress),
    O.map(({ walletType }) => walletType)
  )

export const getSendTxTimerValue = (status: TxHashRD) =>
  FP.pipe(
    status,
    RD.fold(
      () => 0,
      FP.flow(
        O.map(({ loaded }) => loaded),
        O.getOrElse(() => 0)
      ),
      () => 0,
      () => 100
    )
  )

export const getSendTxDescription = ({
  status,
  asset,
  intl
}: {
  status: TxHashRD
  asset: Asset
  intl: IntlShape
}): string =>
  FP.pipe(
    status,
    RD.fold(
      () => emptyString,
      () =>
        `${intl.formatMessage({ id: 'common.step' }, { current: 1, total: 1 })}: ${intl.formatMessage(
          { id: 'common.tx.sendingAsset' },
          { assetTicker: asset.ticker }
        )}`,
      () => emptyString,
      () => intl.formatMessage({ id: 'common.tx.success' })
    )
  )
