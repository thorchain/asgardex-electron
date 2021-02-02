import React, { useCallback, useMemo, useState } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'
import { Row, Col, List, Dropdown } from 'antd'
import { MenuProps } from 'antd/lib/menu'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { ReactComponent as DownIcon } from '../../../assets/svg/icon-down.svg'
import { ReactComponent as UnlockOutlined } from '../../../assets/svg/icon-unlock-warning.svg'
import { truncateAddress } from '../../../helpers/addressHelper'
import { LedgerAddressParams } from '../../../services/chain/types'
import { AVAILABLE_NETWORKS } from '../../../services/const'
import { UserAccountType } from '../../../types/wallet'
import { PhraseCopyModal } from '../phrase'
import * as Styled from './Settings.style'

type Props = {
  selectedNetwork: Network
  apiVersion?: string
  changeNetwork: (network: Network) => void
  clientUrl: O.Option<string>
  userAccounts?: O.Option<UserAccountType[]>
  runeNativeAddress: string
  lockWallet?: () => void
  removeKeystore?: () => void
  exportKeystore?: (runeNativeAddress: string, selectedNetwork: Network) => void
  retrieveLedgerAddress: ({ chain, network }: LedgerAddressParams) => void
  removeLedgerAddress: (chain: Chain) => void
  removeAllLedgerAddress: () => void
  phrase?: O.Option<string>
  clickAddressLinkHandler: (chain: Chain, address: Address) => void
}

export const Settings: React.FC<Props> = (props): JSX.Element => {
  const intl = useIntl()
  const {
    apiVersion = '',
    clientUrl,
    selectedNetwork,
    userAccounts = O.none,
    runeNativeAddress = '',
    lockWallet = () => {},
    removeKeystore = () => {},
    exportKeystore = () => {},
    /* Hide `addDevice` for all chains temporarily
    retrieveLedgerAddress,
    */
    /* Hide `removeDevice` for all chains temporarily
    removeLedgerAddress,
    */
    removeAllLedgerAddress,
    changeNetwork,
    phrase: oPhrase = O.none,
    clickAddressLinkHandler
  } = props

  const [showPhrase, setShowPhrase] = useState(false)

  const removeWallet = useCallback(() => {
    removeKeystore()
  }, [removeKeystore])

  /* Hide `addDevice` for all chains temporarily
  const addDevice = useCallback(
    (chain: Chain) => {
      retrieveLedgerAddress({ chain, network: selectedNetwork })
    },
    [retrieveLedgerAddress, selectedNetwork]
  )
  */

  /* Hide `removeDevice` for all chains temporarily
  const removeDevice = useCallback(
    (chain: Chain) => {
      removeLedgerAddress(chain)
    },
    [removeLedgerAddress]
  )
  */

  const phrase = useMemo(
    () =>
      pipe(
        oPhrase,
        O.map((phrase) => phrase),
        O.getOrElse(() => '')
      ),
    [oPhrase]
  )

  const accounts = useMemo(
    () =>
      pipe(
        userAccounts,
        O.map((accounts) => (
          <Col key={'accounts'} sm={{ span: 24 }} md={{ span: 12 }}>
            <Styled.Subtitle>{intl.formatMessage({ id: 'setting.account.management' })}</Styled.Subtitle>
            <Styled.AccountCard>
              <List
                dataSource={accounts}
                renderItem={(item, i: number) => (
                  <Styled.ListItem key={i}>
                    <Styled.ChainName>{item.chainName}</Styled.ChainName>
                    {item.accounts.map((acc, j) => (
                      <Styled.ChainContent key={j}>
                        <Styled.AccountPlaceholder>{acc.name}</Styled.AccountPlaceholder>
                        <Styled.AccountContent>
                          <Styled.AccountAddress>
                            <label>
                              {acc.address}
                              <Styled.AddressLinkIcon
                                onClick={() => clickAddressLinkHandler(item.chainName, acc.address)}
                              />
                            </label>
                            <label>
                              <Styled.Tooltip title={acc.address}>
                                {truncateAddress(acc.address, item.chainName, selectedNetwork)}
                              </Styled.Tooltip>
                              <Styled.AddressLinkIcon
                                onClick={() => clickAddressLinkHandler(item.chainName, acc.address)}
                              />
                              <Styled.CopyLabel copyable={{ text: acc.address }} />
                            </label>
                          </Styled.AccountAddress>
                          {/* Hide `removeDevice` for all chains temporarily
                          {acc.type === 'external' && (
                            <Button type="link" danger onClick={() => removeDevice(item.chainName)}>
                              <StopOutlined />
                            </Button>
                          )}
                          */}
                        </Styled.AccountContent>
                      </Styled.ChainContent>
                    ))}
                    {/* Hide `addDevice` for all chains temporarily
                    <Styled.Button
                      onClick={() => addDevice(item.chainName)}
                      typevalue="transparent"
                      style={{ margin: '10px 0 15px 12px', boxShadow: 'none' }}>
                      <PlusCircleFilled />
                      {intl.formatMessage({ id: 'setting.add.device' })}
                    </Styled.Button>
                    */}
                  </Styled.ListItem>
                )}
              />
            </Styled.AccountCard>
          </Col>
        )),
        O.getOrElse(() => <></>)
      ),
    [clickAddressLinkHandler, intl, selectedNetwork, userAccounts]
  )

  const changeNetworkHandler: MenuProps['onClick'] = useCallback(
    (param) => {
      const asset = param.key as Network
      changeNetwork(asset)
      removeAllLedgerAddress()
    },
    [changeNetwork, removeAllLedgerAddress]
  )

  const networkMenu = useMemo(
    () => (
      <Styled.NetworkMenu onClick={changeNetworkHandler}>
        {AVAILABLE_NETWORKS.map((network) => (
          <Styled.NetworkMenuItem key={network}>
            <Styled.NetworkLabel>{network}</Styled.NetworkLabel>
          </Styled.NetworkMenuItem>
        ))}
      </Styled.NetworkMenu>
    ),
    [changeNetworkHandler]
  )

  return (
    <>
      <PhraseCopyModal phrase={phrase} visible={showPhrase} onClose={() => setShowPhrase(false)} />
      <Row>
        <Col span={24}>
          <Styled.TitleWrapper>
            <Styled.Title>{intl.formatMessage({ id: 'setting.title' })}</Styled.Title>
          </Styled.TitleWrapper>
          <Styled.Divider />
        </Col>
      </Row>
      <Styled.Row gutter={[16, 16]}>
        <Col sm={{ span: 24 }} md={{ span: 12 }}>
          <Styled.Subtitle>{intl.formatMessage({ id: 'setting.wallet.management' })}</Styled.Subtitle>
          <Styled.Card>
            <Row>
              <Styled.WalletCol sm={{ span: 24 }} md={{ span: 12 }}>
                <Styled.OptionCard bordered={false}>
                  <Styled.OptionLabel
                    color="primary"
                    size="big"
                    onClick={() => exportKeystore(runeNativeAddress, selectedNetwork)}>
                    {intl.formatMessage({ id: 'setting.export' })}
                  </Styled.OptionLabel>
                </Styled.OptionCard>
              </Styled.WalletCol>
              <Styled.WalletCol sm={{ span: 24 }} md={{ span: 12 }}>
                <Styled.OptionCard bordered={false}>
                  <Styled.OptionLabel color="warning" size="big" onClick={lockWallet}>
                    {intl.formatMessage({ id: 'setting.lock' })} <UnlockOutlined />
                  </Styled.OptionLabel>
                </Styled.OptionCard>
              </Styled.WalletCol>
              <Styled.WalletCol sm={{ span: 24 }} md={{ span: 12 }}>
                <Styled.OptionCard bordered={false}>
                  <Styled.Button
                    sizevalue="xnormal"
                    color="primary"
                    typevalue="outline"
                    round="true"
                    onClick={() => setShowPhrase(true)}
                    disabled={O.isNone(oPhrase) ? true : false}>
                    {intl.formatMessage({ id: 'setting.view.phrase' })}
                  </Styled.Button>
                </Styled.OptionCard>
              </Styled.WalletCol>
              <Styled.WalletCol sm={{ span: 24 }} md={{ span: 12 }}>
                <Styled.OptionCard bordered={false}>
                  <Styled.Button
                    sizevalue="xnormal"
                    color="error"
                    typevalue="outline"
                    round="true"
                    onClick={removeWallet}>
                    {intl.formatMessage({ id: 'wallet.action.remove' })}
                  </Styled.Button>
                </Styled.OptionCard>
              </Styled.WalletCol>
            </Row>
          </Styled.Card>
          <Styled.Subtitle>{intl.formatMessage({ id: 'setting.client' })}</Styled.Subtitle>
          <Styled.Card>
            <Row>
              <Col span={24}>
                <Styled.Placeholder>{intl.formatMessage({ id: 'setting.midgard' })}</Styled.Placeholder>

                <Styled.ClientLabel>
                  {pipe(
                    clientUrl,
                    O.getOrElse(() => intl.formatMessage({ id: 'setting.notconnected' }))
                  )}
                </Styled.ClientLabel>

                <Styled.Placeholder>{intl.formatMessage({ id: 'setting.version' })}</Styled.Placeholder>
                <Styled.ClientLabel>v{apiVersion}</Styled.ClientLabel>
                <Styled.Placeholder>{intl.formatMessage({ id: 'common.network' })}</Styled.Placeholder>
                {/* Disable dropbox for the first public release */}
                <Dropdown overlay={networkMenu} trigger={['click']} disabled>
                  <Row align="middle" style={{ display: 'inline-flex' }} onClick={(e) => e.preventDefault()}>
                    <Styled.NetworkTitle>{selectedNetwork}</Styled.NetworkTitle>
                    <DownIcon />
                  </Row>
                </Dropdown>
              </Col>
            </Row>
          </Styled.Card>
        </Col>
        {accounts}
      </Styled.Row>
    </>
  )
}
