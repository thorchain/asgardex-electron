import { Route } from '../types'
import * as depositRoutes from './deposit'
import * as poolDetailRoutes from './poolDetail'
import * as swapRoutes from './swap'

export const base: Route<void> = {
  template: `/pools`,
  path() {
    return this.template
  }
}

export const deposit = depositRoutes.deposit

export const swap = swapRoutes.swap

export const poolDetail = poolDetailRoutes.poolDetail
