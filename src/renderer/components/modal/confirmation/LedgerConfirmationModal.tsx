import { Chain, chainToString } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { getChainAsset } from '../../../helpers/chainHelper'
import { ConfirmationModal } from './ConfirmationModal'
import * as Styled from './LedgerConfirmationModal.styles'

type Props = {
  visible: boolean
  network: Network
  onSuccess: FP.Lazy<void>
  onClose: FP.Lazy<void>
  chain: Chain
  description?: string
}

export const LedgerConfirmationModal: React.FC<Props> = ({
  visible,
  onClose,
  onSuccess,
  chain,
  network,
  description = ''
}) => {
  const intl = useIntl()

  const asset = getChainAsset(chain)

  return (
    <ConfirmationModal
      visible={visible}
      onClose={onClose}
      onSuccess={onSuccess}
      title={intl.formatMessage({ id: 'ledger.title.sign' })}
      okText={intl.formatMessage({ id: 'common.next' })}
      content={
        <Styled.Content>
          <Styled.LedgerContainer>
            <Styled.LedgerConnect />
            <Styled.AssetIcon asset={asset} network={network} size="small" />
          </Styled.LedgerContainer>
          <Styled.Description>
            {intl.formatMessage({ id: 'ledger.needsconnected' }, { chain: chainToString(chain) })}
          </Styled.Description>
          {description && <Styled.Description>{description}</Styled.Description>}
        </Styled.Content>
      }
    />
  )
}
