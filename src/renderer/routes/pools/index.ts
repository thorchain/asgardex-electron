import * as baseRoutes from './base'
import * as depositRoutes from './deposit'
import * as poolDetailRoutes from './detail'
import * as saversRoutes from './savers'
import * as swapRoutes from './swap'

export const base = baseRoutes.base
export const pending = baseRoutes.pending
export const active = baseRoutes.active
export const deposit = depositRoutes.deposit
export const savers = saversRoutes.base
export const { swap, swapToCustom } = swapRoutes
export const detail = poolDetailRoutes.poolDetail
