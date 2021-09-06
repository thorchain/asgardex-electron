import { HaltMessages } from '../types'

const halt: HaltMessages = {
  'halt.thorchain': 'THORChain is halted temporarily.',
  'halt.trading': 'Trade has been halted for all pools temporarily.',
  'halt.chain': '{chain} chain has been halted temporarily.',
  'halt.chains': '{chains} chains have been halted temporarily.',
  'halt.chain.trading': 'Trade has been halted for {chains} chain(s) temporarily.',
  'halt.chain.pause': 'Liquidity activities (add/remove) for {chains} chain(s) have been disabled temporarily.',
  'halt.chain.upgrade': 'Upgrade for {chains} is disabled for maintenance temporarily.'
}

export default halt
