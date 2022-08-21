import React from 'react'

import { Row, Col } from 'antd'

import type { WordType } from './NewPhraseConfirm.types'
import * as Styled from './Phrase.styles'

type Props = {
  words: WordType[]
  onWordClick?: (id: string) => void
  readOnly?: boolean
  wordIcon?: React.ReactNode
  className?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Phrase = React.forwardRef<any, Props>(
  ({ words, onWordClick = () => {}, readOnly, wordIcon = null, className = '' }, ref) => {
    return (
      <Styled.Row ref={ref} className={className}>
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
