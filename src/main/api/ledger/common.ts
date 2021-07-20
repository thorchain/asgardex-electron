import TransportNodeHidSingleton from '@ledgerhq/hw-transport-node-hid-singleton'

export const getTransport = async () => await TransportNodeHidSingleton.open()
