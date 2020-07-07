import React, { useCallback, useMemo } from 'react'

import { LeftOutlined } from '@ant-design/icons'
import { Row, Col } from 'antd'
import { useIntl } from 'react-intl'
import { useParams, useHistory } from 'react-router-dom'

import Button from '../../components/uielements/button'
import { shortSymbol } from '../../helpers/tokenHelpers'
import { AssetDetailsRouteParams } from '../../routes/wallet'
import * as walletRoutes from '../../routes/wallet'
import { UserTransactionType, UserAssetType } from '../../types/wallet'
import DynamicCoin from '../shared/icons/DynamicCoin'
import {
  StyledCard,
  StyledLabel,
  CoinInfoWrapper,
  CoinTitle,
  CoinSubtitle,
  CoinPrice,
  StyledDivider,
  ActionWrapper
} from './AssetDetails.style'
import TransactionsTable from './UserTransactionsTable'

// Dummy data
const txs: UserTransactionType[] = [
  {
    _id: 0,
    blockHeight: 74645396,
    code: 0,
    confirmBlocks: 0,
    data: null,
    fromAddr: 'tbnb1vxutrxadm0utajduxfr6wd9kqfalv0dg2wnx5y',
    memo: '',
    orderId: null,
    proposalId: null,
    sequence: 29,
    source: 0,
    timeStamp: '2020-04-01T03:46:55.786Z',
    toAddr: null,
    txAge: 1578666,
    txAsset: 'RUNE-A1F',
    txFee: '0.00500000',
    txHash: '320C31E9B5E5D21B4912BBC09C4A6F04EC4666698D6EAEBBBA3DBFAA7B9D17B3',
    txType: 'FREEZE_TOKEN',
    value: '12.00000000'
  }
]

const AssetDetails: React.FC = (): JSX.Element => {
  const { symbol } = useParams<AssetDetailsRouteParams>()
  const history = useHistory()
  const intl = useIntl()
  // Dummy data
  const asset: UserAssetType = useMemo(
    () => ({
      _id: '2',
      free: 1034,
      frozen: 38,
      locked: 101,
      symbol: symbol,
      name: shortSymbol(symbol),
      full: 35.13
    }),
    [symbol]
  )

  const sendable = () => asset.free > 0

  const onBack = useCallback(() => {
    history.goBack()
  }, [history])

  const walletActionSendClick = useCallback(() => history.push(walletRoutes.fundsSend.path()), [history])
  const walletActionReceiveClick = useCallback(() => history.push(walletRoutes.fundsReceive.path()), [history])

  return (
    <>
      <Row>
        <Col span={24}>
          <StyledLabel size="large" color="primary" weight="bold" onClick={onBack}>
            <LeftOutlined />
            <span>Back</span>
          </StyledLabel>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <StyledCard bordered={false} bodyStyle={{ display: 'flex', flexDirection: 'row' }}>
            <div>
              <DynamicCoin type={asset.symbol} size="xbig" />
            </div>
            <CoinInfoWrapper>
              <CoinTitle>{shortSymbol(asset.symbol)}</CoinTitle>
              <CoinSubtitle>{asset.symbol}</CoinSubtitle>
            </CoinInfoWrapper>
            <CoinPrice>{asset.full?.toLocaleString()}</CoinPrice>
          </StyledCard>
        </Col>

        <StyledDivider />

        <Col span={24}>
          <Row>
            <Col span={24}>
              <ActionWrapper bordered={false}>
                <Button
                  type="primary"
                  round="true"
                  sizevalue="xnormal"
                  disabled={!sendable()}
                  onClick={walletActionSendClick}>
                  {intl.formatMessage({ id: 'wallet.action.send' })}
                </Button>
                <Button typevalue="outline" round="true" sizevalue="xnormal" onClick={walletActionReceiveClick}>
                  {intl.formatMessage({ id: 'wallet.action.receive' })}
                </Button>
              </ActionWrapper>
            </Col>
          </Row>
        </Col>
        <StyledDivider />
        <Col span={24}>
          <TransactionsTable transactions={txs} />
        </Col>
      </Row>
    </>
  )
}
export default AssetDetails
