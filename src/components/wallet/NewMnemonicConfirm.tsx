import React, { useCallback, useState } from 'react'

import { RedoOutlined } from '@ant-design/icons'
import { Card, Col, Row, Button, Form } from 'antd'
import { Store } from 'antd/lib/form/interface'
import { v4 as uuidv4 } from 'uuid'

import { isSelectedFactory } from '../../helpers/isSelectedHelper'

type WordType = {
  text: string
  _id: string
  sequence?: number
  error?: boolean
  selected?: boolean
}

const MnemonicConfirmScreen: React.FC<{ mnemonic: string; onConfirm: Function }> = ({
  mnemonic,
  onConfirm
}): JSX.Element => {
  const [wordsList, setWordsList] = useState<WordType[]>([])
  const [shuffledWordsList, setShuffledWordsList] = useState<WordType[]>([])
  const [loadingMsg] = useState<string>('')
  const [mnemonicError, setMnemonicError] = useState<string>('')
  const [initialized, setInitialized] = useState<boolean>(false)

  const shuffledWords = useCallback((words: WordType[]) => {
    const shuffler = (arr: WordType[]) => {
      const newArr = arr.slice()
      for (let i = newArr.length - 1; i > 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1))
        ;[newArr[i], newArr[rand]] = [newArr[rand], newArr[i]]
      }
      return newArr
    }
    return words.length > 0 ? shuffler(words) : []
  }, [])

  const init = useCallback(() => {
    const words = mnemonic.split(' ')
    if (words && !initialized) {
      const res = words.map((e: string) => {
        const uniqueId = uuidv4()
        return { text: e, _id: uniqueId }
      })
      setWordsList(res)
      setShuffledWordsList(shuffledWords(res))
      setInitialized(true)
    }
  }, [mnemonic, initialized, shuffledWords])

  const sortedSelectedWords = useCallback((): WordType[] => {
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
  }, [wordsList])

  init()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isSelected = useCallback(isSelectedFactory(wordsList, '_id'), [wordsList])

  const checkPhraseConfirmWords = useCallback(() => {
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
  }, [wordsList, sortedSelectedWords])

  const handleResetPhrase = useCallback(() => {
    const newWords = wordsList.map((e: WordType) => {
      e.selected = false
      e.error = false
      delete e.sequence
      return e
    })
    setWordsList(newWords)
    setMnemonicError('')
  }, [wordsList])
  const handleAddWord = useCallback(
    (id: string) => {
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
    },
    [sortedSelectedWords, wordsList]
  )
  const handleRemoveWord = useCallback(
    (id: string) => {
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
    },
    [wordsList]
  )
  const handleFormSubmit = useCallback(
    (formData: Store) => {
      console.log('submitting form')
      console.log(formData)

      const checkwords = checkPhraseConfirmWords()

      if (checkwords) {
        // The submitted phrase as a string for passing to wallet methods
        onConfirm()
        const repeatPhrase = wordsList
          .filter((e: WordType) => e.selected === true)
          .map((f: WordType) => {
            return f.text
          })
          .join(' ')
        console.log(repeatPhrase)
      }
    },
    [checkPhraseConfirmWords, onConfirm, wordsList]
  )
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
        <Form.Item>
          <Button size="large" type="primary" htmlType="submit" block>
            {loadingMsg || 'Confirm'}
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

export default MnemonicConfirmScreen
