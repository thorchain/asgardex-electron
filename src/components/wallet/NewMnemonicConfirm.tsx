import React, { useState } from 'react'
import { Card, Col, Row, Button, Input, Form } from 'antd'
import { RedoOutlined } from '@ant-design/icons'
import { Store } from 'antd/lib/form/interface'

type WordType = {
  text: string
  _id: string
  sequence?: number
  error?: boolean
  selected?: boolean
}
const mnemonic = 'real debris regret sea auto random agree police uncover gloom cloud ribbon'

const MnemonicConfirmScreen: React.FC = (): JSX.Element => {
  const [wordsList, setWordsList] = useState<WordType[]>([])
  const [shuffledWordsList, setShuffledWordsList] = useState<WordType[]>([])
  const [loadingMsg] = useState<string>('')
  const [mnemonicError, setMnemonicError] = useState<string>('')
  const [initialized, setInitialized] = useState<boolean>(false)

  function init() {
    const words = mnemonic.split(' ')
    if (words && !initialized) {
      const res = words.map((e: string) => {
        const uniqueId = Math.random().toString(36).substring(2) + Date.now().toString(36)
        return { text: e, _id: uniqueId }
      })
      setWordsList(res)
      setShuffledWordsList(shuffledWords(res))
      setInitialized(true)
    }
  }

  function shuffledWords(words: WordType[]) {
    const shuffler = (arr: WordType[]) => {
      const newArr = arr.slice()
      for (let i = newArr.length - 1; i > 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1))
        ;[newArr[i], newArr[rand]] = [newArr[rand], newArr[i]]
      }
      return newArr
    }
    return words.length > 0 ? shuffler(words) : []
  }

  function sortedSelectedWords(): WordType[] {
    function compare(a: WordType, b: WordType) {
      const num1 = a.sequence
      const num2 = b.sequence
      let comparison = 0
      if (num1 && num2 && num1 > num2) {
        comparison = 1
      } else if (num1 && num2 && num1 < num2) {
        comparison = -1
      }
      return comparison
    }
    return wordsList.filter((e: WordType) => e.selected === true).sort(compare)
  }

  init()

  const isSelected = (id: string) => {
    const res: WordType | undefined = wordsList.find((e: WordType) => e._id === id)
    return !!res?.selected
  }

  const checkPhraseConfirmWords = () => {
    // check against original phrase order
    const words = wordsList

    const selectedWords = sortedSelectedWords()
    if (words.length === selectedWords.length) {
      let isErr = false
      for (let i = 0; i < words.length; i++) {
        const word = words[i]
        const selectWord = selectedWords[i]

        if (word._id !== selectWord._id) {
          const newWords = wordsList.map((e: WordType) => {
            if (e._id === selectWord._id) {
              e.error = true
            }
            return e
          })
          setWordsList(newWords)
          isErr = true
        }
      }
      return !isErr
    } else {
      setMnemonicError('Complete confirmation')
      return false
    }
  }

  const handleResetPhrase = () => {
    const newWords = wordsList.map((e: WordType) => {
      e.selected = false
      e.error = false
      delete e.sequence
      return e
    })
    setWordsList(newWords)
    setMnemonicError('')
  }
  const handleAddWord = (id: string) => {
    const selects: WordType[] = sortedSelectedWords()
    const lastSequence = (selects[selects.length - 1] && selects[selects.length - 1].sequence) || 0
    const newSequence = lastSequence >= 0 ? lastSequence + 1 : 0
    const newWords = wordsList.map((e: WordType) => {
      if (e._id === id) {
        e.selected = true
        e.sequence = newSequence
      }
      return e
    })
    setWordsList(newWords)
    setMnemonicError('')
  }
  const handleRemoveWord = (id: string) => {
    const newWords = wordsList.map((e: WordType) => {
      if (e._id === id) {
        e.selected = false
        e.error = false
        delete e.sequence
      }
      return e
    })
    setWordsList(newWords)
    setMnemonicError('')
  }
  const handleFormSubmit = (formData: Store) => {
    console.log('submitting form')
    console.log(formData)

    const checkwords = checkPhraseConfirmWords()

    if (checkwords) {
      // The submitted phrase as a string for passing to wallet methods
      const repeatPhrase = wordsList
        .filter((e: WordType) => e.selected === true)
        .map((f: WordType) => {
          return f.text
        })
        .join(' ')
      console.log(repeatPhrase)
    }
  }
  return (
    <>
      <Form labelCol={{ span: 24 }} onFinish={(e: Store) => handleFormSubmit(e)}>
        <Form.Item
          name="mnemonic"
          label="Confirm Phrase"
          validateStatus={mnemonicError && 'error'}
          help={!!mnemonicError && mnemonicError}>
          <Row>
            <Col span={24}>
              <Card bodyStyle={{ padding: '6px', minHeight: '100px' }}>
                <div>
                  {sortedSelectedWords().map((word: WordType) => (
                    <Button
                      key={word._id}
                      disabled={!!loadingMsg}
                      danger={word.error}
                      onClick={() => word._id && handleRemoveWord(word._id)}
                      style={{ margin: '6px' }}>
                      {word.text}
                    </Button>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item
          label={
            <>
              Select in correct order
              <Button type="link" onClick={handleResetPhrase}>
                <RedoOutlined />
              </Button>
            </>
          }>
          <Row>
            {shuffledWordsList.map((word: WordType) => (
              <Col sm={{ span: 12 }} md={{ span: 8 }} key={word._id} style={{ padding: '6px' }}>
                <Button type="primary" disabled={isSelected(word._id)} block onClick={() => handleAddWord(word._id)}>
                  {word.text}
                </Button>
              </Col>
            ))}
          </Row>
        </Form.Item>
        <Form.Item name="password" label="New Password">
          <Input size="large" type="password" />
        </Form.Item>
        <Form.Item name="repeatPassword" label="Repeat Password">
          <Input size="large" type="password" />
        </Form.Item>
        <Form.Item>
          <Button size="large" type="primary" htmlType="submit" block>
            {loadingMsg || 'Generate'}
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

export default MnemonicConfirmScreen
