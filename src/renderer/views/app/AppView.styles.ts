import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Alert as UIAlert } from '../../components/uielements/alert'
import { media } from '../../helpers/styleHelper'

export const AppWrapper = styled.div`
  height: 100vh;
  background: ${palette('background', 3)};
  padding: 0;

  font-family: 'MainFontRegular';

  a {
    transition: none;
  }

  .ant {
    &-btn,
    &-input,
    &-menu,
    &-input-affix-wrapper,
    &-table-thead > tr > th,
    &-table-tbody > tr > td {
      transition: none;
    }
    &-spin-dot-item {
      background-color: ${palette('primary', 0)};
    }
    &-form-item-explain {
      text-transform: uppercase;
    }
    &-form-item-explain-error {
      color: ${palette('error', 0)};
    }
  }
`

export const AppLayout = styled(A.Layout)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  background: ${palette('background', 3)};
`

export const Alert = styled(UIAlert)`
  margin-bottom: 10px;
  &:first-child {
  }
  ${media.lg`
    margin-bottom: 40px;

    &:first-child{
      margin-bottom: 10px;
    }
  `}
`
