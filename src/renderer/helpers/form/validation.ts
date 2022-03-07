import { isValidBN } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/lib/function'

export const validateBN =
  (errorMsg: string) =>
  (value: BigNumber): E.Either<string, BigNumber> =>
    FP.pipe(value, isValidBN, (valid) => (valid ? E.right(value) : E.left(errorMsg)))

export const lessThanOrEqualTo =
  (max: BigNumber) =>
  (errorMsg: string) =>
  (value: BigNumber): E.Either<string, BigNumber> =>
    FP.pipe(value, (valueBN) => (valueBN.isLessThanOrEqualTo(max) ? E.right(value) : E.left(errorMsg)))

export const greaterThan =
  (max: BigNumber) =>
  (errorMsg: string) =>
  (value: BigNumber): E.Either<string, BigNumber> =>
    FP.pipe(value, (valueBN) => (valueBN.isGreaterThan(max) ? E.right(value) : E.left(errorMsg)))

export const greaterThanEqualTo =
  (max: BigNumber) =>
  (errorMsg: string) =>
  (value: BigNumber): E.Either<string, BigNumber> =>
    FP.pipe(value, (valueBN) => (valueBN.isGreaterThanOrEqualTo(max) ? E.right(value) : E.left(errorMsg)))

export const validateAddress =
  <T extends (value: string) => boolean>(validator: T, emptyErrorMsg: string, invalidAddressMsg: string) =>
  (value: string): E.Either<string, string> => {
    if (!value) {
      return E.left(emptyErrorMsg)
    }
    if (!validator(value.toLowerCase())) {
      return E.left(invalidAddressMsg)
    }
    return E.right(value)
  }
