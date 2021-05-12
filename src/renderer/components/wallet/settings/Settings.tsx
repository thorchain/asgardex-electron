import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'
import { Row, Col, List } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { ReactComponent as UnlockOutlined } from '../../../assets/svg/icon-unlock-warning.svg'
import { LedgerAddressParams } from '../../../services/chain/types'
import { ValidatePasswordHandler } from '../../../services/wallet/types'
import { UserAccountType } from '../../../types/wallet'
import { PasswordModal } from '../../modal/password'
import { AddressEllipsis } from '../../uielements/addressEllipsis'
import { PhraseCopyModal } from '../phrase'
import * as Styled from './Settings.style'

type Props = {
  selectedNetwork: Network
  apiVersion?: string
  clientUrl: O.Option<string>
  userAccounts?: O.Option<UserAccountType[]>
  runeNativeAddress: string
  lockWallet?: () => void
  removeKeystore?: () => void
  exportKeystore?: (runeNativeAddress: string, selectedNetwork: Network) => void
  retrieveLedgerAddress: ({ chain, network }: LedgerAddressParams) => void
  removeLedgerAddress: (chain: Chain) => void
  phrase?: O.Option<string>
  clickAddressLinkHandler: (chain: Chain, address: Address) => void
  validatePassword$: ValidatePasswordHandler
  appUpdateState: RD.RemoteData<Error, O.Option<string>>
  checkForUpdates: () => void
  goToReleasePage: (version: string) => void
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
    phrase: oPhrase = O.none,
    clickAddressLinkHandler,
    validatePassword$,
    appUpdateState = RD.initial,
    checkForUpdates,
    goToReleasePage = FP.constVoid
  } = props

  const [showPhraseModal, setShowPhraseModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

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
      FP.pipe(
        oPhrase,
        O.map((phrase) => phrase),
        O.getOrElse(() => '')
      ),
    [oPhrase]
  )

  const renderAddressWithBreak = useCallback(
    (chain: Chain, address: Address, linkIcon: React.ReactElement) => (
      <Styled.Text>
        <AddressEllipsis
          className="setting-address"
          address={address}
          chain={chain}
          network={selectedNetwork}
          enableCopy={true}
          linkIcon={linkIcon}
        />
      </Styled.Text>
    ),
    [selectedNetwork]
  )

  const accounts = useMemo(
    () =>
      FP.pipe(
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
                              {renderAddressWithBreak(
                                item.chainName,
                                acc.address,
                                <Styled.AddressLinkIcon
                                  onClick={() => clickAddressLinkHandler(item.chainName, acc.address)}
                                />
                              )}
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
    [clickAddressLinkHandler, renderAddressWithBreak, intl, userAccounts]
  )

  const onSuccessPassword = useCallback(() => {
    setShowPasswordModal(false)
    setShowPhraseModal(true)
  }, [setShowPasswordModal, setShowPhraseModal])

  const checkUpdatesProps = useMemo(() => {
    const commonProps = {
      onClick: checkForUpdates,
      children: <>{intl.formatMessage({ id: 'update.checkForUpdates' })}</>
    }

    return FP.pipe(
      appUpdateState,
      RD.fold(
        () => commonProps,
        () => ({
          ...commonProps,
          loading: true,
          disabled: true
        }),
        () => ({
          ...commonProps
        }),
        (oVersion) => ({
          ...commonProps,
          ...FP.pipe(
            oVersion,
            O.fold(
              () => ({
                onClick: checkForUpdates
              }),
              (version) => ({
                onClick: () => goToReleasePage(version),
                children: (
                  <>
                    {intl.formatMessage({ id: 'update.link' })} <Styled.ExternalLinkIcon />
                  </>
                )
              })
            )
          )
        })
      )
    )
  }, [appUpdateState, checkForUpdates, goToReleasePage, intl])

  const versionUpdateResult = useMemo(
    () =>
      FP.pipe(
        appUpdateState,
        RD.fold(
          FP.constNull,
          FP.constNull,
          ({ message }) => (
            <Styled.ClientErrorLabel>
              {intl.formatMessage({ id: 'update.checkFailed' }, { error: message })}
            </Styled.ClientErrorLabel>
          ),
          O.fold(
            () => <Styled.Placeholder>{intl.formatMessage({ id: 'update.noUpdate' })}</Styled.Placeholder>,
            (version) => (
              <Styled.Placeholder>{intl.formatMessage({ id: 'update.description' }, { version })}</Styled.Placeholder>
            )
          )
        )
      ),
    [appUpdateState, intl]
  )

  return (
    <>
      {showPasswordModal && (
        <PasswordModal
          validatePassword$={validatePassword$}
          onSuccess={onSuccessPassword}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
      {showPhraseModal && (
        <PhraseCopyModal
          phrase={phrase}
          visible={showPhraseModal}
          onClose={() => {
            setShowPhraseModal(false)
          }}
        />
      )}
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
                    onClick={() => setShowPasswordModal(true)}
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
                  {FP.pipe(
                    clientUrl,
                    O.getOrElse(() => intl.formatMessage({ id: 'setting.notconnected' }))
                  )}
                </Styled.ClientLabel>

                <Styled.Placeholder>{intl.formatMessage({ id: 'setting.version' })}</Styled.Placeholder>
                <Styled.ClientLabel>v{apiVersion}</Styled.ClientLabel>
                <Styled.UpdatesButton {...checkUpdatesProps} />
                {versionUpdateResult}
              </Col>
            </Row>
          </Styled.Card>
        </Col>
        {accounts}
      </Styled.Row>
    </>
  )
}
