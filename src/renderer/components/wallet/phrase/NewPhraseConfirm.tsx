import React, { useCallback, useMemo, useState } from 'react'

import { DeleteOutlined, RedoOutlined } from '@ant-design/icons'
import { Col, Row, Button as AButton } from 'antd'
import shuffleArray from 'lodash.shuffle'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { isSelectedFactory, sortedSelected } from '../../../helpers/array'
import * as walletRoutes from '../../../routes/wallet'
import { Button } from '../../uielements/button'
import { Phrase } from './index'
import * as NewPhraseStyled from './NewPhrase.styles'
import * as PhraseStyled from './Phrase.styles'

export type WordType = {
  text: string
  _id: string
  sequence?: number
  error?: boolean
  selected?: boolean
}

export const checkPhraseConfirmWordsFactory =
  (setWordsList: (words: WordType[]) => void, setMnemonicError: (error: string) => void) =>
  (words: WordType[], selectedWords: WordType[]) => {
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

export const NewPhraseConfirm: React.FC<{ mnemonic: string; onConfirm: () => Promise<void> }> = ({
  mnemonic,
  onConfirm
}): JSX.Element => {
  const [wordsList, setWordsList] = useState<WordType[]>([])
  const [shuffledWordsList, setShuffledWordsList] = useState<WordType[]>([])
  const [mnemonicError, setMnemonicError] = useState<string>('')
  const [initialized, setInitialized] = useState<boolean>(false)
  const intl = useIntl()
  const history = useHistory()

  const updateWordList = useCallback(
    (wordList: WordType[]) => {
      setMnemonicError('')
      setWordsList(wordList)
    },
    [setWordsList, setMnemonicError]
  )

  const shuffledWords = useCallback<(array: WordType[]) => WordType[]>(shuffleArray, [])

  const init = useCallback(() => {
    const words = mnemonic.split(' ')
    if (words && !initialized) {
      const res = words.map((e: string) => {
        const uniqueId = uuidv4()
        return { text: e, _id: uniqueId }
      })
      updateWordList(res)
      setShuffledWordsList(shuffledWords(res))
      setInitialized(true)
    }
  }, [mnemonic, initialized, shuffledWords, updateWordList])

  const sortedSelectedWords = useMemo(() => {
    return sortedSelected(wordsList, 'sequence')
  }, [wordsList])

  init()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isSelected = useCallback(isSelectedFactory(wordsList, '_id'), [wordsList])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkPhraseConfirmWords = useCallback(checkPhraseConfirmWordsFactory(updateWordList, setMnemonicError), [
    updateWordList,
    setMnemonicError
  ])

  const handleResetPhrase = useCallback(() => {
    const newWords = wordsList.map((e: WordType) => {
      e.selected = false
      e.error = false
      delete e.sequence
      return e
    })
    updateWordList(newWords)
  }, [wordsList, updateWordList])

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
      updateWordList(newWords)
    },
    [sortedSelectedWords, wordsList, updateWordList]
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
      updateWordList(newWords)
    },
    [wordsList, updateWordList]
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
    // In case ALL words were entered in a wrong set error
    else if (wordsList.length === sortedSelectedWords.length) {
      setMnemonicError(intl.formatMessage({ id: 'wallet.create.error.phrase' }))
    }
  }, [checkPhraseConfirmWords, onConfirm, wordsList, sortedSelectedWords, history, intl])

  return (
    <>
      <NewPhraseStyled.TitleContainer>
        <NewPhraseStyled.SectionTitle>
          {intl.formatMessage({ id: 'wallet.create.enter.phrase' })}
        </NewPhraseStyled.SectionTitle>
      </NewPhraseStyled.TitleContainer>
      <NewPhraseStyled.Form labelCol={{ span: 24 }} onFinish={handleFormSubmit}>
        <NewPhraseStyled.FormItem
          name="mnemonic"
          validateStatus={mnemonicError && 'error'}
          help={!!mnemonicError && mnemonicError}>
          <Phrase wordIcon={<DeleteOutlined />} words={sortedSelectedWords} onWordClick={handleRemoveWord} />
        </NewPhraseStyled.FormItem>

        <PhraseStyled.EnterPhraseContainer
          label={
            <NewPhraseStyled.SectionTitle>
              {intl.formatMessage({ id: 'wallet.create.words.click' })}
              <AButton type="link" onClick={handleResetPhrase}>
                <RedoOutlined />
              </AButton>
            </NewPhraseStyled.SectionTitle>
          }>
          <Row>
            {shuffledWordsList.map((word: WordType) => (
              <Col sm={{ span: 12 }} md={{ span: 4 }} key={word._id} style={{ padding: '6px' }}>
                <PhraseStyled.Button
                  type={'text'}
                  size={'large'}
                  disabled={isSelected(word._id)}
                  onClick={() => handleAddWord(word._id)}
                  style={{ margin: '6px' }}>
                  {word.text}
                </PhraseStyled.Button>
              </Col>
            ))}
          </Row>
        </PhraseStyled.EnterPhraseContainer>
        <NewPhraseStyled.SubmitItem>
          <Button size="large" type="primary" round="true" htmlType="submit">
            {intl.formatMessage({ id: 'common.finish' })}
          </Button>
        </NewPhraseStyled.SubmitItem>
      </NewPhraseStyled.Form>
    </>
  )
}
