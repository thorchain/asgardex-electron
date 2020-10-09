import { SwitcherOutlined, UnlockOutlined } from '@ant-design/icons/lib'
import styled from 'styled-components'
import { key, palette } from 'styled-theme'

import LabelBase from '../uielements/label'

export const Container = styled('div')`
  padding: 150px 20px;
  background: ${palette('background', 0)};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`

export const Label = styled(LabelBase)`
  width: auto;
  text-transform: uppercase;
`

export const ConnectIcon = styled(SwitcherOutlined)`
  height: 60px;
  width: 60px;
  margin-bottom: ${key('sizes.gutter.vertical', '0px')};
  color: ${palette('gray', 2)};

  svg {
    height: 100%;
    width: 100%;
  }
`

export const UnlockIcon = styled(UnlockOutlined)`
  height: 60px;
  width: 60px;
  margin-bottom: ${key('sizes.gutter.vertical', '0px')};
  color: ${palette('gray', 2)};

  svg {
    height: 100%;
    width: 100%;
  }
`
