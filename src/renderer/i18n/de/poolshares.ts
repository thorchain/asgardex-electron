import { PoolSharesMessage } from '../types'

const poolShares: PoolSharesMessage = {
  'poolshares.ownership': 'Anteil',
  'poolshares.both.info': 'Beidseitiger Poolanteil ({asset} und {rune})',
  'poolshares.single.info': 'Einseitiger Poolanteil ({asset} oder {rune})',

  'poolshares.single.notsupported':
    'Einseitige Poolanteile ({asset} oder {rune}) werden aktuell in ASGARDEX nicht unterstützt'
}

export default poolShares
