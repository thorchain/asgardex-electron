import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Button as ButtonUI } from '../../../components/uielements/button'

export const HistoryExtraContent = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
`
export const HistoryTypeButton = styled(ButtonUI).attrs({ typevalue: 'transparent' })<{ active: 'true' | 'false' }>`
  width: auto;
  margin-right: 10px;
  padding: 0;

  &.ant-btn {
    color: ${palette('text', 0)};

    border-radius: 0;
    border-bottom: 1px solid ${({ active }) => (active === 'true' ? palette('primary', 0) : 'transparent')} !important;

    &:hover {
      color: ${palette('primary', 0)};
    }
  }

  &:last-child {
    margin: 0;
  }
`
