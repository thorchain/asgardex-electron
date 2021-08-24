import React from 'react'

import { CheckOutlined, CopyOutlined } from '@ant-design/icons'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import * as Styled from './PhraseCopyModal.styles'

type Props = {
  visible: boolean
  phrase: string
  onClose?: FP.Lazy<void>
}

export const PhraseCopyModal: React.FC<Props> = (props): JSX.Element => {
  const { visible, phrase, onClose = FP.constVoid } = props

  const intl = useIntl()

  return (
    <Styled.Modal
      title={intl.formatMessage({ id: 'setting.view.phrase' })}
      visible={visible}
      onOk={onClose}
      onCancel={onClose}
      footer={
        <Styled.CopyLabel
          copyable={{
            text: phrase,
            icon: [
              <div key={1}>
                {intl.formatMessage({ id: 'common.copy' })}
                <CopyOutlined />
              </div>,
              <div key={2}>
                {intl.formatMessage({ id: 'common.copy' })}
                <CheckOutlined />
              </div>
            ]
          }}
        />
      }>
      <Styled.PhraseView>
        {phrase.split(' ').map((item, index) => (
          <Styled.Item key={index}>
            {item}
            <Styled.Number>{index + 1}</Styled.Number>
          </Styled.Item>
        ))}
      </Styled.PhraseView>
    </Styled.Modal>
  )
}
