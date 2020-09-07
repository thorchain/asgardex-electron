import React, { useCallback, useMemo, useState } from 'react'

import { Address } from '@thorchain/asgardex-binance'
import { Asset, assetToString } from '@thorchain/asgardex-util'
import { Row, Col, Grid, Dropdown } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import * as AH from '../../helpers/assetHelper'
import * as walletRoutes from '../../routes/wallet'
import { TxsRD, LoadTxsProps, BalancesRD, SendAction, isSendAction } from '../../services/binance/types'
import { MAX_PAGINATION_ITEMS } from '../../services/const'
import AssetInfo from '../uielements/assets/AssetInfo'
import BackLink from '../uielements/backLink'
import Button, { RefreshButton } from '../uielements/button'
import * as Styled from './AssetDetails.style'
import TransactionsTable from './TransactionsTable'

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
  loadSelectedAssetTxsHandler?: (_: LoadTxsProps) => void
}

const AssetDetails: React.FC<Props> = (props: Props): JSX.Element => {
  const {
    txsRD,
    address,
    balancesRD,
    asset,
    reloadBalancesHandler = () => {},
    loadSelectedAssetTxsHandler = (_: LoadTxsProps) => {},
    explorerUrl = O.none
  } = props

  const [sendAction, setSendAction] = useState<SendAction>('send')
  const [currentPage, setCurrentPage] = useState(1)

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
        history.push(walletRoutes.send.path({ asset: assetAsString }))
        break
      case 'freeze':
        history.push(walletRoutes.freeze.path({ asset: assetAsString }))
        break
      case 'unfreeze':
        history.push(walletRoutes.unfreeze.path({ asset: assetAsString }))
        break
      default:
      // nothing to do
    }
  }, [assetAsString, history, sendAction])

  const walletActionReceiveClick = useCallback(
    () => history.push(walletRoutes.receive.path({ asset: assetAsString })),
    [assetAsString, history]
  )

  const refreshHandler = useCallback(() => {
    loadSelectedAssetTxsHandler({ limit: MAX_PAGINATION_ITEMS, offset: (currentPage - 1) * MAX_PAGINATION_ITEMS })
    reloadBalancesHandler()
  }, [loadSelectedAssetTxsHandler, currentPage, reloadBalancesHandler])

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
      <Styled.ActionMenu onClick={changeActionMenuClickHandler}>
        {menuItems.map(({ key, label }) => (
          <Styled.ActionMenuItem key={key}>
            <Row justify="center">
              <Styled.Label>{label}</Styled.Label>
            </Row>
          </Styled.ActionMenuItem>
        ))}
      </Styled.ActionMenu>
    )
  }, [menuItems])

  const onChangePagination = useCallback(
    (pageNo) => {
      loadSelectedAssetTxsHandler({ limit: MAX_PAGINATION_ITEMS, offset: (pageNo - 1) * MAX_PAGINATION_ITEMS })
      setCurrentPage(pageNo)
    },
    [loadSelectedAssetTxsHandler]
  )

  return (
    <>
      <Row justify="space-between">
        <Col>
          <BackLink path={walletRoutes.assets.path()} />
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
                  <Dropdown overlay={changeActionMenu} placement="bottomCenter" trigger={['click']}>
                    {/* Important note:
                        Label has to be wrapped into a `div` to avoid error render messages
                        such as "Function components cannot be given refs"
                     */}
                    <div>
                      <Styled.Label>{intl.formatMessage({ id: 'common.change' })}</Styled.Label>
                    </div>
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
          <TransactionsTable
            txsRD={txsRD}
            address={address}
            clickTxLinkHandler={clickTxLinkHandler}
            changePaginationHandler={onChangePagination}
          />
        </Col>
      </Row>
    </>
  )
}
export default AssetDetails
