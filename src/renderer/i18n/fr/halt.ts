import { HaltMessages } from '../types'

const halt: HaltMessages = {
  'halt.thorchain': 'THORChain est temporairement interrompu.',
  'halt.trading': 'L’échange sur toutes les pools de liquidité est temporairement interrompu.',
  'halt.chain': 'La chaîne {chain} est temporairement interrompue.',
  'halt.chains': 'Les chaînes {chains} sont temporairement interrompues.',
  'halt.chain.trading': 'L’échange pour {chains} est temporairement interrompu.',
  'halt.chain.pause':
    'Les activités de liquidité (ajouter/retirer) pour la(es) chaîne(s) {chains} sont temporairement désactivées.',
  'halt.chain.pauseall': 'Les activités de liquidité (ajouter/retirer) pour toutes les chaînes ont été temporairement désactivées.',
  'halt.chain.upgrade': 'La mise à jour pour {chains} est temporairement désactivée pour maintenance.'
}

export default halt
