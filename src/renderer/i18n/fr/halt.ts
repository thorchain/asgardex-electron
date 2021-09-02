import { HaltMessages } from '../types'

const halt: HaltMessages = {
  'halt.thorchain': 'THORChain est temporairement interrompu.',
  'halt.trading': 'L’échange sur toutes les pools de liquidité est temporairement interrompu.',
  'halt.trading.eth': 'L’échange pour ETH est temporairement interrompu.',
  'halt.chain': "L'échange pour les actifs des chaînes {chain} est interrompu pour maintenance",
  'halt.chain.upgrade': 'Upgrade for {chainTx} is disabled for maintenance temporarily. - FR'
}

export default halt
