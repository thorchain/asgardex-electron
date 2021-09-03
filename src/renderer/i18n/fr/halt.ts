import { HaltMessages } from '../types'

const halt: HaltMessages = {
  'halt.thorchain': 'THORChain est temporairement interrompu.',
  'halt.trading': 'L’échange sur toutes les pools de liquidité est temporairement interrompu.',
  'halt.chain': '{chain} chain has been halted temporarily - FR',
  'halt.chains': "L'échange pour les actifs des chaînes {chains} est interrompu pour maintenance",
  'halt.chain.pause': 'Liquidity activities (add/remove) for {chains} chain(s) have been disabled temporarily - FR.',
  'halt.chain.trading': 'L’échange pour {chains} est temporairement interrompu.',
  'halt.chain.upgrade': 'La mise à jour pour {chains} est temporairement désactivée pour maintenance.'
}

export default halt
