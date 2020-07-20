import React from 'react'

import { Row, Col } from 'antd'

import * as Styled from './MnemonicPhrase.styles'
import { WordType } from './NewMnemonicConfirm'

type Props = {
  words: WordType[]
  onWordClick?: (id: string) => void
  readOnly?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MnemonicPhrase = React.forwardRef<any, Props>(({ words, onWordClick, readOnly }, ref) => {
  return (
    <Styled.Row ref={ref}>
      <Col span={24}>
        <Styled.Card bodyStyle={{ padding: '6px', minHeight: '100px' }}>
          <Row>
            {words.map((word) => (
              <Col sm={{ span: 12 }} md={{ span: 4 }} key={word._id} style={{ padding: '6px' }}>
                <Styled.Button
                  type={'text'}
                  size={'large'}
                  tabIndex={readOnly ? -1 : 0}
                  danger={word.error}
                  readOnly={readOnly}
                  onClick={readOnly ? undefined : () => word._id && onWordClick && onWordClick(word._id)}
                  style={{ margin: '6px' }}>
                  {word.text}
                </Styled.Button>
              </Col>
            ))}
          </Row>
        </Styled.Card>
      </Col>
    </Styled.Row>
  )
})
