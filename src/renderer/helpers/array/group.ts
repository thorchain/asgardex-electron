import * as A from 'fp-ts/Array'
import { Eq } from 'fp-ts/Eq'

export const groupFactory = <T>(S: Eq<T>): ((as: Array<T>) => Array<Array<T>>) => {
  return A.chop((as) => {
    const { init, rest } = A.spanLeft((a: T) => S.equals(a, as[0]))(as)
    return [init, rest]
  })
}
