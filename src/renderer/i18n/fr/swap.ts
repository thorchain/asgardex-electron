import { SwapMessages } from '../types'

const swap: SwapMessages = {
  'swap.state.pending': 'Échange en cours',
  'swap.state.success': 'Échange réussi',
  'swap.state.error': "Erreur lors de l'échange",
  'swap.input': 'Entrée',
  'swap.balance': 'Solde',
  'swap.output': 'Sortie',
  'swap.drag': 'Glisser pour échanger',
  'swap.searchAsset': 'Rechercher un actif',
  'swap.errors.amount.balanceShouldCoverChainFee':
    '{fee} de frais de transaction doivent être couverts par votre solde (actuellement {balance}).',
  'swap.errors.amount.outputShouldCoverChainFee':
    '{fee} de frais de sortie doivent être couverts par la réception du montant (actuellement {amount}).',
  'swap.note.lockedWallet': 'Vous devez déverrouiller votre portefeuille pour échanger',
  'swap.note.nowallet': 'Créez ou importez un portefeuille pour échanger',
  'swap.errors.asset.missingSourceAsset': 'Actif source manquant',
  'swap.errors.asset.missingTargetAsset': 'Actif cible manquant',
  'swap.approve': 'Approuver'
}

export default swap
