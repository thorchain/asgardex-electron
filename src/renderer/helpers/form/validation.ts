import { bn, isValidBN, bnOrZero } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/lib/function'

export const validateBN = (errorMsg: string) => (value: string): E.Either<string, string> =>
  FP.pipe(value, bn, isValidBN, (valid) => (valid ? E.right(value) : E.left(errorMsg)))

export const lessThanOrEqualTo = (max: BigNumber) => (errorMsg: string) => (value: string): E.Either<string, string> =>
  FP.pipe(value, bnOrZero, (valueBN) => (valueBN.isLessThanOrEqualTo(max) ? E.right(value) : E.left(errorMsg)))

export const greaterThan = (max: BigNumber) => (errorMsg: string) => (value: string): E.Either<string, string> =>
  FP.pipe(value, bn, (valueBN) => (valueBN.isGreaterThan(max) ? E.right(value) : E.left(errorMsg)))
