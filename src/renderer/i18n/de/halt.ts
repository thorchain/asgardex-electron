import { HaltMessages } from '../types'

const halt: HaltMessages = {
  'halt.thorchain': 'THORChain wurde vorübergehend angehalten.',
  'halt.trading': 'Der Handel ist vorübergehend für alle Pools gestoppt.',
  'halt.chain': 'Der Handel in Pools von {chains} Chain(s) wurde aufgrund von Wartungsarbeiten vorübergehend gestoppt.',
  'halt.chain.trading': 'Der Handel für {chains} Chain(s) wurde vorübergehend gestoppt.',
  'halt.chain.upgrade': 'Upgrade für {chains} ist vorübergehend deaktiviert.'
}

export default halt
