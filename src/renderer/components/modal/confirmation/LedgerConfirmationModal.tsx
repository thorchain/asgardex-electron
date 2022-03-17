import { useState } from 'react'

import { toLegacyAddress } from '@xchainjs/xchain-bitcoincash'
import { Address } from '@xchainjs/xchain-client'
import { Chain, chainToString } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { getChainAsset } from '../../../helpers/chainHelper'
import { AttentionIcon } from '../../icons'
import { AddressEllipsis } from '../../uielements/addressEllipsis'
import { ConfirmationModal } from './ConfirmationModal'
import * as Styled from './LedgerConfirmationModal.styles'

type Props = {
  visible: boolean
  network: Network
  onSuccess: FP.Lazy<void>
  onClose: FP.Lazy<void>
  chain: Chain
  description?: string
  addresses?: { sender: Address; recipient: Address }
}

export const LedgerConfirmationModal: React.FC<Props> = ({
  visible,
  onClose,
  onSuccess,
  chain,
  network,
  description = '',
  addresses
}) => {
  const intl = useIntl()

  // const CASHADDR_CONVERTER_URL = 'https://www.bitcoin.com/tools/cash-address-converter'

  const asset = getChainAsset(chain)

  const [showAddresses, setShowAddresses] = useState(false)

  return (
    <ConfirmationModal
      visible={visible}
      onClose={onClose}
      onSuccess={onSuccess}
      title={intl.formatMessage({ id: 'ledger.title.sign' })}
      okText={intl.formatMessage({ id: 'common.next' })}
      content={
        <Styled.Content>
          <Styled.LedgerContainer>
            <Styled.LedgerConnect />
            <Styled.AssetIcon asset={asset} network={network} size="small" />
          </Styled.LedgerContainer>
          <Styled.Description>
            {intl.formatMessage({ id: 'ledger.needsconnected' }, { chain: chainToString(chain) })}
          </Styled.Description>
          {description && <Styled.Description>{description}</Styled.Description>}
          {/* {isBchChain(chain) && (
            <Styled.NoteBCH>
              <Styled.Icon component={AttentionIcon} />
              <FormattedMessage
                id="ledger.legacyformat.note"
                values={{
                  url: (
                    <Styled.CashAddrConverterUrl onClick={() => openUrl(CASHADDR_CONVERTER_URL)}>
                      {CASHADDR_CONVERTER_URL}
                    </Styled.CashAddrConverterUrl>
                  )
                }}
              />
            </Styled.NoteBCH>
          )
          } */}
          {addresses && (
            <>
              <Styled.NoteBCH>
                <Styled.Icon component={AttentionIcon} />
                {intl.formatMessage({ id: 'ledger.legacyformat.note' }, { url: 'ulr' })}
              </Styled.NoteBCH>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Styled.CompareAddressButton
                  typevalue="transparent"
                  type="text"
                  onClick={() => setShowAddresses((current) => !current)}>
                  {intl.formatMessage({ id: showAddresses ? 'ledger.legacyformat.hide' : 'ledger.legacyformat.show' })}
                  <Styled.ExpandIcon rotate={showAddresses ? 270 : 90} />
                </Styled.CompareAddressButton>
              </div>

              {showAddresses && (
                <>
                  <Styled.AddressWrapper>
                    <Styled.AddressContainer>
                      <Styled.AddressTitle>Sender</Styled.AddressTitle>
                      <AddressEllipsis network={network} chain={chain} address={addresses.sender} enableCopy />
                    </Styled.AddressContainer>
                    <Styled.AddressContainer>
                      <Styled.AddressTitle>(Legacy)</Styled.AddressTitle>
                      <AddressEllipsis
                        network={network}
                        chain={chain}
                        address={toLegacyAddress(addresses.sender)}
                        enableCopy
                      />
                    </Styled.AddressContainer>
                  </Styled.AddressWrapper>
                  <Styled.AddressWrapper>
                    <Styled.AddressContainer>
                      <Styled.AddressTitle>Recipient</Styled.AddressTitle>
                      <AddressEllipsis network={network} chain={chain} address={addresses.recipient} enableCopy />
                    </Styled.AddressContainer>
                    <Styled.AddressContainer>
                      <Styled.AddressTitle>(Legacy)</Styled.AddressTitle>
                      <AddressEllipsis
                        network={network}
                        chain={chain}
                        address={toLegacyAddress(addresses.recipient)}
                        enableCopy
                      />
                    </Styled.AddressContainer>
                  </Styled.AddressWrapper>{' '}
                </>
              )}
            </>
          )}
        </Styled.Content>
      }
    />
  )
}
