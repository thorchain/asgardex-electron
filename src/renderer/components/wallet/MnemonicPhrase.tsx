import React from 'react'

import { Button, Card, Col, Row } from 'antd'

import { WordType } from './NewMnemonicConfirm'

type Props = {
  words: WordType[]
  onWordClick?: (id: string) => void
  readOnly?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MnemonicPhrase = React.forwardRef<any, Props>(({ words, onWordClick, readOnly }, ref) => {
  return (
    <Row ref={ref}>
      <Col span={24}>
        <Card bodyStyle={{ padding: '6px', minHeight: '100px' }}>
          <div>
            {words.map((word) => (
              <Button
                key={word._id}
                disabled={!!readOnly}
                danger={word.error}
                onClick={() => word._id && onWordClick && onWordClick(word._id)}
                style={{ margin: '6px' }}>
                {word.text}
              </Button>
            ))}
          </div>
        </Card>
      </Col>
    </Row>
  )
})
