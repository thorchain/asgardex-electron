import { HaltMessages } from '../types'

const halt: HaltMessages = {
  'halt.thorchain': 'THORChain wurde vorübergehend angehalten.',
  'halt.trading': 'Der Handel ist vorübergehend für alle Pools gestoppt.',
  'halt.trading.eth': 'Der Handel für ETH ist vorübergehend gestoppt.',
  'halt.chain': 'Der Handel in Pools von {chain} Chain(s) ist gestoppt aufgrund von Wartungsarbeiten.',
  'halt.chain.upgrade': 'Upgrade für {chains} ist vorübergehend deaktiviert.'
}

export default halt
