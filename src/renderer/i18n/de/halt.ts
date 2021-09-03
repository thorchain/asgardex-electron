import { HaltMessages } from '../types'

const halt: HaltMessages = {
  'halt.thorchain': 'THORChain wurde vorübergehend angehalten.',
  'halt.trading': 'Der Handel ist vorübergehend für alle Pools gestoppt.',
  'halt.chain': 'Der Handel in Pools von {chains} Chain(s) ist gestoppt aufgrund von Wartungsarbeiten.',
  'halt.chain.trading': 'Der Handel für {chains} ist vorübergehend gestoppt.',
  'halt.chain.upgrade': 'Upgrade für {chains} ist vorübergehend deaktiviert.'
}

export default halt
