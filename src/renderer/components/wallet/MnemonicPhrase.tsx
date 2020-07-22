import React from 'react'

import { Row, Col } from 'antd'

import * as Styled from './MnemonicPhrase.styles'
import { WordType } from './NewMnemonicConfirm'

type Props = {
  words: WordType[]
  onWordClick?: (id: string) => void
  readOnly?: boolean
  wordIcon?: React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MnemonicPhrase = React.forwardRef<any, Props>(
  ({ words, onWordClick = () => {}, readOnly, wordIcon = null }, ref) => {
    return (
      <Styled.Row ref={ref}>
        <Col span={24}>
          <Styled.Card>
            <Row>
              {words.map((word) => (
                <Col sm={{ span: 12 }} md={{ span: 4 }} key={word._id} style={{ padding: '6px' }}>
                  <Styled.Button
                    type={'text'}
                    size={'large'}
                    tabIndex={readOnly ? -1 : 0}
                    danger={word.error}
                    readOnly={readOnly}
                    onClick={readOnly ? undefined : () => onWordClick(word._id)}
                    style={{ margin: '6px' }}>
                    {word.text}
                    <Styled.IconWrapper>{wordIcon}</Styled.IconWrapper>
                  </Styled.Button>
                </Col>
              ))}
            </Row>
          </Styled.Card>
        </Col>
      </Styled.Row>
    )
  }
)
