import { SwapMessages } from '../types'

const swap: SwapMessages = {
  'swap.state.pending': 'Swap en cours',
  'swap.state.success': 'Swap réussi',
  'swap.state.error': 'Erreur lors du swap',
  'swap.input': 'Entrée',
  'swap.balance': 'Solde',
  'swap.output': 'Sortie',
  'swap.drag': 'Glisser pour swapper',
  'swap.searchAsset': 'Rechercher un actif',
  'swap.errors.amount.balanceShouldCoverChainFee':
    '{fee} de frais de transaction doivent être couverts par votre solde (actuellement {balance}).',
  'swap.errors.amount.outputShouldCoverChainFee':
    '{fee} de frais de sortie doivent être couverts par la réception du montant (actuellement {amount}).',
  'swap.note.lockedWallet': 'Vous devez déverrouiller votre wallet pour swapper',
  'swap.note.nowallet': 'Créer ou importer un wallet pour swapper',
  'swap.errors.asset.missingSourceAsset': 'Actif source manquant',
  'swap.errors.asset.missingTargetAsset': 'Actif cible manquant'
}

export default swap
