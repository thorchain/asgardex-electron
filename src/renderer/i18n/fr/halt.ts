import { HaltMessages } from '../types'

const halt: HaltMessages = {
  'halt.thorchain': 'THORChain est temporairement interrompu.',
  'halt.trading': 'L’échange sur toutes les pools de liquidité est temporairement interrompu.',
  'halt.chain': "L'échange pour les actifs des chaînes {chains} est interrompu pour maintenance",
  'halt.chain.trading': 'L’échange pour {chains} est temporairement interrompu.',
  'halt.chain.upgrade': 'La mise à jour pour {chains} est temporairement désactivée pour maintenance.'
}

export default halt
