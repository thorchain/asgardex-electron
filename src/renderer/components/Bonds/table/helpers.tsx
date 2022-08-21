import React from 'react'

import { StopOutlined } from '@ant-design/icons'
import { Address } from '@xchainjs/xchain-client'
import { AssetRuneNative, baseToAsset, formatAssetAmountCurrency, THORChain } from '@xchainjs/xchain-util'
import { Col } from 'antd'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { NodeInfo } from '../../../services/thorchain/types'
import { NodeStatusEnum } from '../../../types/generated/thornode'
import * as Styled from './BondsTable.styles'

export const NodeAddress: React.FC<{ address: Address; network: Network }> = ({ address, network }) => (
  <Col xs={18} lg={20} xl={24}>
    <Styled.AddressEllipsis address={address} chain={THORChain} network={network} />
  </Col>
)

export const BondValue: React.FC<{ data: NodeInfo }> = ({ data }) => (
  <Col>
    <Styled.TextLabel align="right" nowrap>
      {formatAssetAmountCurrency({
        asset: AssetRuneNative,
        amount: baseToAsset(data.bond),
        trimZeros: true,
        decimal: 0
      })}
    </Styled.TextLabel>
  </Col>
)

export const AwardValue: React.FC<{ data: NodeInfo }> = ({ data }) => (
  <Col>
    <Styled.TextLabel align="right" nowrap>
      {formatAssetAmountCurrency({
        asset: AssetRuneNative,
        amount: baseToAsset(data.award),
        trimZeros: true,
        decimal: 0
      })}
    </Styled.TextLabel>
  </Col>
)

export const Status: React.FC<{ data: NodeInfo }> = ({ data }) => {
  const intl = useIntl()

  const getStatusMessageId = (status: NodeStatusEnum) => {
    switch (status) {
      case NodeStatusEnum.Active: {
        return 'bonds.status.active'
      }
      case NodeStatusEnum.Standby: {
        return 'bonds.status.standby'
      }
      case NodeStatusEnum.Disabled: {
        return 'bonds.status.disabled'
      }
      case NodeStatusEnum.Whitelisted: {
        return 'bonds.status.whitelisted'
      }
      default: {
        return 'bonds.status.unknown'
      }
    }
  }

  return (
    <Styled.TextLabel align="center">{intl.formatMessage({ id: getStatusMessageId(data.status) })}</Styled.TextLabel>
  )
}

export const Delete: React.FC<{ deleteNode: () => void }> = ({ deleteNode }) => (
  <Styled.DeleteButton onClick={deleteNode}>
    <StopOutlined />
  </Styled.DeleteButton>
)
