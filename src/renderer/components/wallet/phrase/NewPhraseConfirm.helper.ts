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
