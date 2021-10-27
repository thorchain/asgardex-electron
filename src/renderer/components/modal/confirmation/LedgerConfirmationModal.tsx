import { Chain, chainToString } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import { useIntl } from 'react-intl'

import { ConfirmationModal } from './ConfirmationModal'
import * as Styled from './LedgerConfirmationModal.styles'

type Props = {
  visible: boolean
  onSuccess: FP.Lazy<void>
  onClose: FP.Lazy<void>
  chain: Chain
}

export const LedgerConfirmationModal: React.FC<Props> = ({ visible, onClose, onSuccess, chain }) => {
  const intl = useIntl()

  return (
    <ConfirmationModal
      visible={visible}
      onClose={onClose}
      onSuccess={onSuccess}
      title={intl.formatMessage({ id: 'ledger.title.sign' })}
      okText={intl.formatMessage({ id: 'common.next' })}
      message={
        <Styled.Content>
          <Styled.Description>
            {intl.formatMessage({ id: 'ledger.needsconnected' }, { chain: chainToString(chain) })}
          </Styled.Description>
          <Styled.Description>{intl.formatMessage({ id: 'swap.ledger.sign' })}</Styled.Description>
        </Styled.Content>
      }
    />
  )
}
