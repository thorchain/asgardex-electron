import styled from 'styled-components'

import Table from '../../components/uielements/table'

export type WalletAsset = {
  symbol: string
  ticker: string
  balance: number
  value: number
}

export const TableWrapper = styled(Table)`
  .ant-table-thead > tr > th {
    height: 64px;
  }

  .ant-table-tbody > tr > td {
    padding: 0px 16px;
    height: 64px;
  }
`
