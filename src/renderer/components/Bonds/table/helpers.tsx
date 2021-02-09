import React from 'react'

import { StopOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { AssetRuneNative, baseToAsset, formatAssetAmountCurrency, THORChain } from '@xchainjs/xchain-util'
import { Col } from 'antd'
import * as FP from 'fp-ts/function'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { NodeStatus } from '../../../services/thorchain/types'
import { NodeDataRD } from '../types'
import * as Styled from './BondsTable.styles'

export const NodeAddress: React.FC<{ address: Address; network: Network }> = ({ address, network }) => (
  <Col xs={18} lg={20} xl={24}>
    <Styled.AddressEllipsis address={address} chain={THORChain} network={network} />
  </Col>
)

export const BondValue: React.FC<{ data: NodeDataRD }> = ({ data }) => (
  <Styled.BondCol>
    {FP.pipe(
      data,
      RD.map(({ bond }) =>
        formatAssetAmountCurrency({ asset: AssetRuneNative, amount: baseToAsset(bond), trimZeros: true, decimal: 0 })
      ),
      RD.fold(
        () => <Styled.TextLabel>-</Styled.TextLabel>,
        () => <Styled.TextLabel loading={true} />,
        () => <Styled.TextLabel>-</Styled.TextLabel>,
        (value) => <Styled.TextLabel>{value}</Styled.TextLabel>
      )
    )}
  </Styled.BondCol>
)

export const AwardValue: React.FC<{ data: NodeDataRD }> = ({ data }) => (
  <Styled.AwardCol>
    {FP.pipe(
      data,
      RD.map(({ award }) =>
        formatAssetAmountCurrency({ asset: AssetRuneNative, amount: baseToAsset(award), trimZeros: true, decimal: 0 })
      ),
      RD.fold(
        () => <Styled.TextLabel>-</Styled.TextLabel>,
        () => <Styled.TextLabel loading={true} />,
        () => <Styled.TextLabel>-</Styled.TextLabel>,
        (value) => <Styled.TextLabel nowrap>{value}</Styled.TextLabel>
      )
    )}
  </Styled.AwardCol>
)

const getStatusMessageId = (status: NodeStatus) => {
  switch (status) {
    case 'active': {
      return 'bonds.status.active'
    }
    case 'standby': {
      return 'bonds.status.standby'
    }
    case 'disabled': {
      return 'bonds.status.disabled'
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
      () => <Styled.TextLabel>-</Styled.TextLabel>,
      () => <Styled.TextLabel loading={true} />,
      () => <Styled.TextLabel>-</Styled.TextLabel>,
      (value) => {
        return <Styled.TextLabel>{intl.formatMessage({ id: getStatusMessageId(value) })}</Styled.TextLabel>
      }
    )
  )
}

export const Info: React.FC<{ goToNode: () => void }> = ({ goToNode }) => {
  const intl = useIntl()
  return (
    <Styled.InfoButton onClick={goToNode}>
      <Styled.TextLabel>{intl.formatMessage({ id: 'bonds.info' })}</Styled.TextLabel> <Styled.InfoArrow />
    </Styled.InfoButton>
  )
}

export const Delete: React.FC<{ deleteNode: () => void }> = ({ deleteNode }) => (
  <Styled.DeleteButton onClick={deleteNode}>
    <StopOutlined />
  </Styled.DeleteButton>
)
