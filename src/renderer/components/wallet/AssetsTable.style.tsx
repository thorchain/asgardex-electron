import styled from 'styled-components'

import Table from '../uielements/table'

export const TableWrapper = styled(Table)`
  .ant-table-thead > tr > th {
    font-size: 16px;
    font-weight: 600;
    text-transform: uppercase;
    height: 64px;
  }

  .ant-table-tbody > tr > td {
    padding: 0px 16px;
    height: 64px;
  }

  .ant-table-tbody > tr > td > div {
    font-size: 16px;
    font-weight: normal;
    text-transform: uppercase;
  }
`
