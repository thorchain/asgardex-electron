import React, { useCallback, useMemo, useState } from 'react'

import { RedoOutlined } from '@ant-design/icons'
import { Col, Row, Button, Form } from 'antd'
import shuffleArray from 'lodash.shuffle'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router'
import { v4 as uuidv4 } from 'uuid'

import { isSelectedFactory, sortedSelected } from '../../helpers/array'
import * as walletRoutes from '../../routes/wallet'
import { MnemonicPhrase } from './MnemonicPhrase'

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

const MnemonicConfirmScreen: React.FC<{ mnemonic: string; onConfirm: () => Promise<void> }> = ({
  mnemonic,
  onConfirm
}): JSX.Element => {
  const [wordsList, setWordsList] = useState<WordType[]>([])
  const [shuffledWordsList, setShuffledWordsList] = useState<WordType[]>([])
  const [mnemonicError, setMnemonicError] = useState<string>('')
  const [initialized, setInitialized] = useState<boolean>(false)
  const intl = useIntl()
  const history = useHistory()

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
  const handleFormSubmit = useCallback(() => {
    const checkwords = checkPhraseConfirmWords(wordsList, sortedSelectedWords)

    if (checkwords) {
      onConfirm()
        .then(() => {
          history.push(walletRoutes.base.path())
        })
        .catch(() => {
          setMnemonicError(intl.formatMessage({ id: 'wallet.create.error' }))
        })
    }
  }, [checkPhraseConfirmWords, onConfirm, wordsList, sortedSelectedWords, history, intl])
  return (
    <>
      <Form labelCol={{ span: 24 }} onFinish={handleFormSubmit}>
        <Form.Item
          name="mnemonic"
          label={intl.formatMessage({ id: 'wallet.create.enter.phrase' })}
          validateStatus={mnemonicError && 'error'}
          help={!!mnemonicError && mnemonicError}>
          <MnemonicPhrase words={sortedSelectedWords} onWordClick={handleRemoveWord} />
        </Form.Item>

        <Form.Item
          label={
            <>
              {intl.formatMessage({ id: 'wallet.create.words.click' })}
              <Button type="link" onClick={handleResetPhrase}>
                <RedoOutlined />
              </Button>
            </>
          }>
          <Row>
            {shuffledWordsList.map((word: WordType) => (
              <Col sm={{ span: 12 }} md={{ span: 8 }} key={word._id} style={{ padding: '6px' }}>
                <Button type="ghost" disabled={isSelected(word._id)} block onClick={() => handleAddWord(word._id)}>
                  {word.text}
                </Button>
              </Col>
            ))}
          </Row>
        </Form.Item>
        <Form.Item>
          <Button size="large" type="primary" htmlType="submit" block>
            {intl.formatMessage({ id: 'common.confirm' })}
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

export default MnemonicConfirmScreen
