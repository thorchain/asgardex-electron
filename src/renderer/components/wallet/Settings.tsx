import React, { useCallback, useMemo } from 'react'

import { StopOutlined } from '@ant-design/icons'
import { Row, Col, Button, List } from 'antd'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'
import { useIntl } from 'react-intl'

import { ReactComponent as UnlockOutlined } from '../../assets/svg/icon-unlock-warning.svg'
import { Network } from '../../services/app/types'
import { UserAccountType } from '../../types/wallet'
import {
  StyledTitleWrapper,
  StyledRow,
  StyledWalletCol,
  StyledTitle,
  StyledDivider,
  StyledSubtitle,
  StyledCard,
  StyledOptionCard,
  StyledOptionLabel,
  StyledButton,
  StyledPlaceholder,
  StyledClientLabel,
  StyledClientButton,
  StyledAccountCard,
  StyledListItem,
  StyledChainName,
  StyledChainContent,
  StyledAccountPlaceholder,
  StyledAccountContent,
  StyledAccountAddress
} from './Settings.style'

type Props = {
  network: Network
  apiVersion?: string
  toggleNetwork?: () => void
  clientUrl: O.Option<string>
  userAccounts?: O.Option<UserAccountType[]>
  lockWallet?: () => void
  removeKeystore?: () => void
}

const Settings: React.FC<Props> = (props: Props): JSX.Element => {
  const intl = useIntl()
  const {
    apiVersion = '',
    clientUrl,
    network,
    userAccounts = O.none,
    toggleNetwork = () => {},
    lockWallet = () => {},
    removeKeystore = () => {}
  } = props

  const removeWallet = useCallback(() => {
    removeKeystore()
  }, [removeKeystore])

  const accounts = useMemo(
    () =>
      pipe(
        userAccounts,
        O.map((accounts) => (
          <Col key={'accounts'} sm={{ span: 24 }} md={{ span: 12 }}>
            <StyledSubtitle>{intl.formatMessage({ id: 'setting.account.management' })}</StyledSubtitle>
            <StyledAccountCard>
              <List
                dataSource={accounts}
                renderItem={(item, i: number) => (
                  <StyledListItem key={i}>
                    <StyledChainName>{item.chainName}</StyledChainName>
                    {item.accounts.map((acc, j) => (
                      <StyledChainContent key={j}>
                        <StyledAccountPlaceholder>{acc.name}</StyledAccountPlaceholder>
                        <StyledAccountContent>
                          <StyledAccountAddress>{acc.address}</StyledAccountAddress>
                          {acc.type === 'external' && (
                            <Button type="link" danger>
                              <StopOutlined />
                            </Button>
                          )}
                        </StyledAccountContent>
                      </StyledChainContent>
                    ))}
                  </StyledListItem>
                )}
              />
            </StyledAccountCard>
          </Col>
        )),
        O.getOrElse(() => <></>)
      ),
    [intl, userAccounts]
  )

  return (
    <>
      <Row>
        <Col span={24}>
          <StyledTitleWrapper>
            <StyledTitle>{intl.formatMessage({ id: 'setting.title' })}</StyledTitle>
          </StyledTitleWrapper>
          <StyledDivider />
        </Col>
      </Row>
      <StyledRow gutter={[16, 16]}>
        <Col sm={{ span: 24 }} md={{ span: 12 }}>
          <StyledSubtitle>{intl.formatMessage({ id: 'setting.wallet.management' })}</StyledSubtitle>
          <StyledCard>
            <Row>
              <StyledWalletCol sm={{ span: 24 }} md={{ span: 12 }}>
                <StyledOptionCard bordered={false}>
                  <StyledOptionLabel color="primary" size="big">
                    {intl.formatMessage({ id: 'setting.export' })}
                  </StyledOptionLabel>
                </StyledOptionCard>
              </StyledWalletCol>
              <StyledWalletCol sm={{ span: 24 }} md={{ span: 12 }}>
                <StyledOptionCard bordered={false}>
                  <StyledOptionLabel color="warning" size="big" onClick={lockWallet}>
                    {intl.formatMessage({ id: 'setting.lock' })} <UnlockOutlined />
                  </StyledOptionLabel>
                </StyledOptionCard>
              </StyledWalletCol>
              <StyledWalletCol sm={{ span: 24 }} md={{ span: 12 }}>
                <StyledOptionCard bordered={false}>
                  <StyledButton sizevalue="xnormal" color="primary" typevalue="outline" round="true" disabled>
                    {intl.formatMessage({ id: 'setting.view.phrase' })}
                  </StyledButton>
                </StyledOptionCard>
              </StyledWalletCol>
              <StyledWalletCol sm={{ span: 24 }} md={{ span: 12 }}>
                <StyledOptionCard bordered={false}>
                  <StyledButton
                    sizevalue="xnormal"
                    color="error"
                    typevalue="outline"
                    round="true"
                    onClick={removeWallet}>
                    {intl.formatMessage({ id: 'wallet.action.remove' })}
                  </StyledButton>
                </StyledOptionCard>
              </StyledWalletCol>
            </Row>
          </StyledCard>
          <StyledSubtitle>{intl.formatMessage({ id: 'setting.client' })}</StyledSubtitle>
          <StyledCard>
            <Row>
              <Col span={24}>
                <StyledPlaceholder>{intl.formatMessage({ id: 'setting.midgard' })}</StyledPlaceholder>

                <StyledClientLabel>
                  {pipe(
                    clientUrl,
                    O.getOrElse(() => intl.formatMessage({ id: 'setting.notconnected' }))
                  )}
                </StyledClientLabel>

                <StyledPlaceholder>{intl.formatMessage({ id: 'setting.version' })}</StyledPlaceholder>
                <StyledClientLabel>v{apiVersion}</StyledClientLabel>
                <StyledClientButton color="warning" size="big" onClick={toggleNetwork}>
                  Change to {network === Network.MAIN ? 'testnet' : 'mainnet'}
                </StyledClientButton>
              </Col>
            </Row>
          </StyledCard>
        </Col>
        {accounts}
      </StyledRow>
    </>
  )
}

export default Settings
