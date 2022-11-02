import { PoolSharesMessage } from '../types'

const poolShares: PoolSharesMessage = {
  'poolshares.ownership': 'Participation',
  'poolshares.both.info': 'Partage des deux côtés ({asset} et {rune})',
  'poolshares.single.info': "Partage d'un seul côté ({asset} ou {rune})",
  'poolshares.single.notsupported':
    "Le partage de pool d'un seul coté ({asset} ou {rune}) n'est pas pris en charge dans ASGARDEX actuellement"
}

export default poolShares
