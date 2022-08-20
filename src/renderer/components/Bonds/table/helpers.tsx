import React from 'react'

import { StopOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { AssetRuneNative, baseToAsset, formatAssetAmountCurrency, THORChain } from '@xchainjs/xchain-util'
import { Col } from 'antd'
import * as FP from 'fp-ts/function'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { NodeDataRD } from '../../../services/thorchain/types'
import { NodeStatusEnum } from '../../../types/generated/thornode'
import * as Styled from './BondsTable.styles'

export const NodeAddress: React.FC<{ address: Address; network: Network }> = ({ address, network }) => (
  <Col xs={18} lg={20} xl={24}>
    <Styled.AddressEllipsis address={address} chain={THORChain} network={network} />
  </Col>
)

export const BondValue: React.FC<{ data: NodeDataRD }> = ({ data }) => (
  <Col>
    {FP.pipe(
      data,
      RD.map(({ bond }) =>
        formatAssetAmountCurrency({ asset: AssetRuneNative, amount: baseToAsset(bond), trimZeros: true, decimal: 0 })
      ),
      RD.fold(
        () => <Styled.TextLabel align="right">-</Styled.TextLabel>,
        () => <Styled.TextLabel align="right" loading={true} />,
        () => <Styled.TextLabel align="right">-</Styled.TextLabel>,
        (value) => (
          <Styled.TextLabel align="right" nowrap>
            {value}
          </Styled.TextLabel>
        )
      )
    )}
  </Col>
)

export const AwardValue: React.FC<{ data: NodeDataRD }> = ({ data }) => (
  <Col>
    {FP.pipe(
      data,
      RD.map(({ award }) =>
        formatAssetAmountCurrency({ asset: AssetRuneNative, amount: baseToAsset(award), trimZeros: true, decimal: 0 })
      ),
      RD.fold(
        () => <Styled.TextLabel align="right">-</Styled.TextLabel>,
        () => <Styled.TextLabel align="right" loading={true} />,
        () => <Styled.TextLabel align="right">-</Styled.TextLabel>,
        (value) => (
          <Styled.TextLabel align="right" nowrap>
            {value}
          </Styled.TextLabel>
        )
      )
    )}
  </Col>
)

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

export const Status: React.FC<{ data: NodeDataRD }> = ({ data }) => {
  const intl = useIntl()
  return FP.pipe(
    data,
    RD.map(({ status }) => status),
    RD.fold(
      () => <Styled.TextLabel align="center">-</Styled.TextLabel>,
      () => <Styled.TextLabel align="center" loading={true} />,
      () => <Styled.TextLabel align="center">-</Styled.TextLabel>,
      (value) => {
        return (
          <Styled.TextLabel align="center">{intl.formatMessage({ id: getStatusMessageId(value) })}</Styled.TextLabel>
        )
      }
    )
  )
}

export const Delete: React.FC<{ deleteNode: () => void }> = ({ deleteNode }) => (
  <Styled.DeleteButton onClick={deleteNode}>
    <StopOutlined />
  </Styled.DeleteButton>
)
