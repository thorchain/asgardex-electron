import { useCallback, useState } from 'react'

import { isCashAddress, toCashAddress, toLegacyAddress } from '@xchainjs/xchain-bitcoincash'
import { Address, Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { chainToString } from '../../../../shared/utils/chain'
import { getChainAsset, isBchChain } from '../../../helpers/chainHelper'
import { AttentionIcon } from '../../icons'
import { AddressEllipsis } from '../../uielements/addressEllipsis'
import { ConfirmationModal } from './ConfirmationModal'
import * as Styled from './LedgerConfirmationModal.styles'

type Addresses = { sender: Address; recipient: Address }

type Props = {
  visible: boolean
  network: Network
  onSuccess: FP.Lazy<void>
  onClose: FP.Lazy<void>
  chain: Chain
  description1?: string
  description2?: string
  addresses: O.Option<Addresses>
}

export const LedgerConfirmationModal: React.FC<Props> = ({
  visible,
  onClose,
  onSuccess,
  chain,
  network,
  description1,
  description2 = '',
  addresses: oAddresses
}) => {
  const intl = useIntl()

  const asset = getChainAsset(chain)

  const [showAddresses, setShowAddresses] = useState(false)

  const renderBchAddresses = useCallback(
    ({ sender, recipient }: Addresses) => {
      const textToCopy = `${intl.formatMessage({ id: 'common.sender' })} (CashAddr)\n${
        isCashAddress(sender) ? sender : toCashAddress(sender)
      }\n${intl.formatMessage({ id: 'common.sender' })} (Legacy)\n${toLegacyAddress(sender)}\n${intl.formatMessage({
        id: 'common.recipient'
      })} (CashAddr)\n${isCashAddress(recipient) ? recipient : toCashAddress(recipient)}\n${intl.formatMessage({
        id: 'common.recipient'
      })} (Legacy)\n${toLegacyAddress(recipient)}`

      return (
        <>
          {/* Sender */}
          <Styled.AddressWrapper>
            <Styled.AddressContainer>
              <Styled.AddressTitle>{intl.formatMessage({ id: 'common.sender' })} (CashAddr)</Styled.AddressTitle>
              <AddressEllipsis
                network={network}
                chain={chain}
                address={isCashAddress(sender) ? sender : toCashAddress(sender)}
                enableCopy
              />
            </Styled.AddressContainer>
            <Styled.AddressContainer>
              <Styled.AddressTitle>{intl.formatMessage({ id: 'common.sender' })} (Legacy)</Styled.AddressTitle>
              <AddressEllipsis network={network} chain={chain} address={toLegacyAddress(sender)} enableCopy />
            </Styled.AddressContainer>
          </Styled.AddressWrapper>
          {/* Recipient */}
          <Styled.AddressWrapper>
            <Styled.AddressContainer>
              <Styled.AddressTitle>{intl.formatMessage({ id: 'common.recipient' })} (CashAddr)</Styled.AddressTitle>
              <AddressEllipsis
                network={network}
                chain={chain}
                address={isCashAddress(recipient) ? recipient : toCashAddress(recipient)}
                enableCopy
              />
            </Styled.AddressContainer>
            <Styled.AddressContainer>
              <Styled.AddressTitle>{intl.formatMessage({ id: 'common.recipient' })} (Legacy)</Styled.AddressTitle>
              <AddressEllipsis network={network} chain={chain} address={toLegacyAddress(recipient)} enableCopy />
            </Styled.AddressContainer>
          </Styled.AddressWrapper>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Styled.CopyLabel label={'Copy all addresses'} textToCopy={textToCopy} />
          </div>
        </>
      )
    },
    [chain, intl, network]
  )

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
            {description1 || intl.formatMessage({ id: 'ledger.needsconnected' }, { chain: chainToString(chain) })}
          </Styled.Description>
          {description2 && <Styled.Description>{description2}</Styled.Description>}
          {isBchChain(chain) &&
            FP.pipe(
              oAddresses,
              O.fold(
                () => <></>,
                (bchAddresses) => (
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
                        {intl.formatMessage({
                          id: showAddresses ? 'ledger.legacyformat.hide' : 'ledger.legacyformat.show'
                        })}
                        <Styled.ExpandIcon rotate={showAddresses ? 270 : 90} />
                      </Styled.CompareAddressButton>
                    </div>

                    {showAddresses && renderBchAddresses(bchAddresses)}
                  </>
                )
              )
            )}
        </Styled.Content>
      }
    />
  )
}
