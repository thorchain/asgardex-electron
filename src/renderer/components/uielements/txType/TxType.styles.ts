import { UpCircleOutlined } from '@ant-design/icons/lib'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Label as LabelUI } from '../label'

export const Container = styled.div`
  display: flex;
  align-items: center;
`

export const Label = styled(LabelUI)`
  margin-left: 10px;
  padding: 0;
  width: auto;
  font-size: 14px;
  text-transform: uppercase;
`

export const IconContainer = styled.span`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;

  svg {
    stroke: ${palette('primary', 0)};
  }
`

export const UpgradeIcon = styled(UpCircleOutlined)`
  svg {
    width: 20px;
    height: 20px;
    fill: ${palette('primary', 0)};
  }
`
