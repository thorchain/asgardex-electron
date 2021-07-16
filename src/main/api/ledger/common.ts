import TransportWebUSB from '@ledgerhq/hw-transport-webusb'

export const getTransport = async () => await TransportWebUSB.create()
