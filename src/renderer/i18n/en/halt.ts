import { HaltMessages } from '../types'

const halt: HaltMessages = {
  'halt.thorchain': 'THORChain is halted temporarily.',
  'halt.trading': 'Trading for all pools is halted temporarily.',
  'halt.chain': 'Trading for pools on {chains} chain(s) is halted temporarily.',
  'halt.chain.trading': 'Trading for {chains} is halted temporarily.',
  'halt.chain.upgrade': 'Upgrade for {chains} is disabled for maintenance temporarily.'
}

export default halt
