import { checkPhraseConfirmWordsFactory } from './NewPhraseConfirm.helper'
import type { WordType } from './NewPhraseConfirm.types'

describe('wallet/NewMnemonicConfirm', () => {
  let wordsMock: WordType[]
  let setWordsList: jest.Mock
  let setMnemonicError: jest.Mock

  beforeEach(() => {
    wordsMock = [{ _id: '1' }, { _id: '2' }, { _id: '3' }, { _id: '4' }, { _id: '5' }, { _id: '6' }] as WordType[]

    setWordsList = jest.fn()
    setMnemonicError = jest.fn()
  })

  it('should trigger error callback if not filled yet', () => {
    const res = checkPhraseConfirmWordsFactory(setWordsList, setMnemonicError)(wordsMock, [])

    expect(setMnemonicError).toBeCalled()
    expect(res).toBeFalsy()
  })

  it('words should be in different order', () => {
    const res = checkPhraseConfirmWordsFactory(setWordsList, setMnemonicError)(wordsMock, wordsMock)
    expect(res).toBeTruthy()
    expect(setWordsList).toBeCalledWith(wordsMock)
    expect(setMnemonicError).not.toBeCalled()
  })

  it('should set error to true for missmatched elements', () => {
    const a = [{ _id: '1' }, { _id: '5' }, { _id: '3' }, { _id: '4' }, { _id: '6' }, { _id: '2' }] as WordType[]
    const res = checkPhraseConfirmWordsFactory(setWordsList, setMnemonicError)(wordsMock, a)
    expect(res).toBeFalsy()
    expect(setWordsList).toBeCalledWith([
      { _id: '1' },
      { _id: '2', error: true },
      { _id: '3' },
      { _id: '4' },
      { _id: '5', error: true },
      { _id: '6', error: true }
    ])
    expect(setMnemonicError).not.toBeCalled()
  })
})
