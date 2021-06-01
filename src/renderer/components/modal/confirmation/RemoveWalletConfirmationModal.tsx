import * as FP from 'fp-ts/function'
import { useIntl } from 'react-intl'

import { ConfirmationModal } from './ConfirmationModal'
import * as Styled from './RemoveWalletConfirmationModal.styles'

type Props = {
  visible: boolean
  onSuccess: FP.Lazy<void>
  onClose: FP.Lazy<void>
}

export const RemoveWalletConfirmationModal: React.FC<Props> = ({ visible, onClose, onSuccess }) => {
  const intl = useIntl()

  return (
    <ConfirmationModal
      visible={visible}
      onClose={onClose}
      onSuccess={onSuccess}
      message={
        <Styled.Content>
          <Styled.TitleText>{intl.formatMessage({ id: 'wallet.action.remove.title' })}</Styled.TitleText>
          <Styled.DescriptionText>
            {intl.formatMessage({ id: 'wallet.action.remove.description' })}
          </Styled.DescriptionText>
        </Styled.Content>
      }
    />
  )
}
