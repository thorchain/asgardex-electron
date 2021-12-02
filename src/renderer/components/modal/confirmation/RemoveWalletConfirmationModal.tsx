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
      title={intl.formatMessage({ id: 'wallet.remove.label' })}
      okText={intl.formatMessage({ id: 'wallet.action.forget' })}
      content={
        <Styled.Content>
          <Styled.TitleText>{intl.formatMessage({ id: 'wallet.remove.label.title' })}</Styled.TitleText>
          <Styled.DescriptionText>
            {intl.formatMessage({ id: 'wallet.remove.label.description' })}
          </Styled.DescriptionText>
        </Styled.Content>
      }
    />
  )
}
