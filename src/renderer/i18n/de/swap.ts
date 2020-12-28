import { SwapMessages } from '../types'

const swap: SwapMessages = {
  'swap.swapping': 'Tauschen',
  'swap.state.success': 'Erfolgreich getauscht',
  'swap.input': 'Eingabe',
  'swap.balance': 'Guthaben',
  'swap.output': 'Ausgabe',
  'swap.drag': 'Ziehen um zu Swappen',
  'swap.searchAsset': 'Suche Asset',
  'swap.errors.amount.balanceShouldCoverChainFee':
    'Transaktionsgebühr in Höhe von {fee} ist nicht über Dein Guthaben {balance} gedeckt.',
  'swap.errors.amount.outputShouldCoverChainFee':
    'Auszahlungsgebühr in Höhe von {fee} ist nicht über den zu erwartenen Auszahlungsbetrag (momentan {amount}) gedeckt'
}

export default swap
