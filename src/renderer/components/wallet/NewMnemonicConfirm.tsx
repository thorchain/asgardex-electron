import React, { useCallback, useMemo, useState } from 'react'

import { RedoOutlined } from '@ant-design/icons'
import { Card, Col, Row, Button, Form } from 'antd'
import { Store } from 'antd/lib/form/interface'
import shuffleArray from 'lodash.shuffle'
import { v4 as uuidv4 } from 'uuid'

import { isSelectedFactory, sortedSelected } from '../../helpers/array'

export type WordType = {
  text: string
  _id: string
  sequence?: number
  error?: boolean
  selected?: boolean
}

export const checkPhraseConfirmWordsFactory = (
  setWordsList: (words: WordType[]) => void,
  setMnemonicError: (error: string) => void
) => (words: WordType[], selectedWords: WordType[]) => {
  if (words.length === selectedWords.length) {
    let isErr = false
    let newWords = [...words]

    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const selectedWord = selectedWords[i]

      if (word._id !== selectedWord._id) {
        // eslint-disable-next-line no-loop-func
        newWords = words.map((e: WordType) => {
          if (e._id === selectedWord._id) {
            e.error = true
          }
          isErr = true
          return e
        })
      }
    }
    setWordsList(newWords)
    return !isErr
  } else {
    setMnemonicError('Complete confirmation')
    return false
  }
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

  const shuffledWords = useCallback<(array: WordType[]) => WordType[]>(shuffleArray, [])

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

  const sortedSelectedWords = useMemo(() => {
    return sortedSelected(wordsList, 'sequence')
  }, [wordsList])

  init()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isSelected = useCallback(isSelectedFactory(wordsList, '_id'), [wordsList])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkPhraseConfirmWords = useCallback(checkPhraseConfirmWordsFactory(setWordsList, setMnemonicError), [
    setWordsList,
    setMnemonicError
  ])

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
      const selects: WordType[] = sortedSelectedWords
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

      const checkwords = checkPhraseConfirmWords(wordsList, sortedSelectedWords)

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
    [checkPhraseConfirmWords, onConfirm, wordsList, sortedSelectedWords]
  )
  return (
    <>
      <Form labelCol={{ span: 24 }} onFinish={handleFormSubmit}>
        <Form.Item
          name="mnemonic"
          label="Confirm Phrase"
          validateStatus={mnemonicError && 'error'}
          help={!!mnemonicError && mnemonicError}>
          <Row>
            <Col span={24}>
              <Card bodyStyle={{ padding: '6px', minHeight: '100px' }}>
                <div>
                  {sortedSelectedWords.map((word) => (
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
