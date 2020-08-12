import React, { useCallback, useMemo, useState } from 'react'

import { Address } from '@thorchain/asgardex-binance'
import { Asset, assetToString } from '@thorchain/asgardex-util'
import { Row, Col, Grid, Menu, Dropdown } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import * as AH from '../../helpers/assetHelper'
import * as walletRoutes from '../../routes/wallet'
import { TxsRD, BalancesRD } from '../../services/binance/types'
import AssetInfo from '../uielements/assets/AssetInfo'
import BackLink from '../uielements/backLink'
import Button, { RefreshButton } from '../uielements/button'
import Label from '../uielements/label'
import * as Styled from './AssetDetails.style'
import TransactionsTable from './TransactionsTable'

type SendAction = 'send' | 'freeze' | 'unfreeze'

// type guard to check possible values of `SendAction`
const isSendAction = (action: string): action is SendAction => {
  switch (action) {
    case 'send':
    case 'freeze':
    case 'unfreeze':
      return true
    default:
      return false
  }
}

type SendActionMenuItem = {
  key: SendAction
  label: string
}

type Props = {
  txsRD: TxsRD
  balancesRD: BalancesRD
  asset: O.Option<Asset>
  address: O.Option<Address>
  explorerUrl?: O.Option<string>
  reloadBalancesHandler?: () => void
  reloadSelectedAssetTxsHandler?: () => void
}

const AssetDetails: React.FC<Props> = (props: Props): JSX.Element => {
  const {
    txsRD,
    address,
    balancesRD,
    asset,
    reloadBalancesHandler = () => {},
    reloadSelectedAssetTxsHandler = () => {},
    explorerUrl = O.none
  } = props

  const [sendAction, setSendAction] = useState<SendAction>('send')

  const assetAsString = useMemo(
    () =>
      FP.pipe(
        asset,
        O.map((a) => assetToString(a)),
        O.getOrElse(() => '')
      ),
    [asset]
  )

  const isRuneAsset = useMemo(() => FP.pipe(asset, O.filter(AH.isRuneAsset), O.isSome), [asset])
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false
  const history = useHistory()
  const intl = useIntl()

  const walletActionSendClick = useCallback(() => {
    switch (sendAction) {
      case 'send':
        history.push(walletRoutes.fundsSend.path({ asset: assetAsString }))
        break
      case 'freeze':
        console.log('TODO Add freeze route')
        break
      case 'unfreeze':
        console.log('TODO Add unfreeze route')
        break
      default:
      // nothing to do
    }
  }, [assetAsString, history, sendAction])

  const walletActionReceiveClick = useCallback(
    () => history.push(walletRoutes.fundsReceive.path({ asset: assetAsString })),
    [assetAsString, history]
  )

  const refreshHandler = useCallback(() => {
    reloadSelectedAssetTxsHandler()
    reloadBalancesHandler()
  }, [reloadBalancesHandler, reloadSelectedAssetTxsHandler])

  const clickTxLinkHandler = useCallback(
    (txHash: string) => {
      FP.pipe(
        explorerUrl,
        O.map((url) => window.apiUrl.openExternal(`${url}/tx/${txHash}`))
      )
    },
    [explorerUrl]
  )

  const changeActionMenuClickHandler = ({ key }: { key: React.Key }) => {
    if (isSendAction(key.toString())) {
      setSendAction(key as SendAction)
    }
  }

  const menuItems: SendActionMenuItem[] = useMemo(
    () => [
      {
        key: 'send',
        label: intl.formatMessage({ id: 'wallet.action.send' })
      },
      {
        key: 'freeze',
        label: intl.formatMessage({ id: 'wallet.action.freeze' })
      },
      {
        key: 'unfreeze',
        label: intl.formatMessage({ id: 'wallet.action.unfreeze' })
      }
    ],
    [intl]
  )

  const sendButtonLabel = useMemo(() => menuItems.find(({ key }) => key === sendAction)?.label ?? '', [
    sendAction,
    menuItems
  ])

  const changeActionMenu = useMemo(() => {
    return (
      <Menu onClick={changeActionMenuClickHandler}>
        {menuItems
          .filter(({ key }) => key !== sendAction)
          .map(({ key, label }) => (
            <Menu.Item key={key}>
              <Row align="middle">
                <Label textTransform="uppercase" align="center">
                  {label}
                </Label>
              </Row>
            </Menu.Item>
          ))}
      </Menu>
    )
  }, [menuItems, sendAction])

  return (
    <>
      <Row justify="space-between">
        <Col>
          <BackLink />
        </Col>
        <Col>
          <RefreshButton clickHandler={refreshHandler} />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <AssetInfo asset={asset} balancesRD={balancesRD} />
        </Col>

        <Styled.Divider />

        <Styled.ActionRow>
          <Styled.ActionCol sm={{ span: 24 }} md={{ span: 12 }}>
            <Styled.ActionWrapper>
              <Row justify="center">
                <Button type="primary" round="true" sizevalue="xnormal" onClick={walletActionSendClick}>
                  {sendButtonLabel}
                </Button>
              </Row>
              {isRuneAsset && (
                <Row justify="center">
                  <Dropdown overlay={changeActionMenu} trigger={['click']}>
                    <Label textTransform="uppercase" align="center" color="primary" size="big">
                      {intl.formatMessage({ id: 'common.change' })}
                    </Label>
                  </Dropdown>
                </Row>
              )}
            </Styled.ActionWrapper>
          </Styled.ActionCol>
          <Styled.ActionCol sm={{ span: 24 }} md={{ span: 12 }}>
            <Styled.ActionWrapper>
              <Row justify="center">
                <Button typevalue="outline" round="true" sizevalue="xnormal" onClick={walletActionReceiveClick}>
                  {intl.formatMessage({ id: 'wallet.action.receive' })}
                </Button>
              </Row>
            </Styled.ActionWrapper>
          </Styled.ActionCol>
        </Styled.ActionRow>
        <Styled.Divider />
      </Row>
      <Row>
        <Col span={24}>
          <Styled.TableHeadline isDesktop={isDesktopView}>
            {intl.formatMessage({ id: 'wallet.txs.last90days' })}
          </Styled.TableHeadline>
        </Col>
        <Col span={24}>
          <TransactionsTable txsRD={txsRD} address={address} clickTxLinkHandler={clickTxLinkHandler} />
        </Col>
      </Row>
    </>
  )
}
export default AssetDetails
