import * as A from 'antd'
import AT from 'antd/lib/typography/Text'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../helpers/styleHelper'
import { InnerForm } from '../../shared/form/Form.styles'
import { Button as BaseButton } from '../../uielements/button'

export const Form = styled(InnerForm)`
  flex: 1;
  display: flex;
  flex-direction: column;
`

export const FormItem = styled(A.Form.Item)`
  width: 100%;
  margin: 0;
`

export const Header = styled('div')`
  display: flex;
  justify-content: center;
  position: relative;
`

export const Text = styled(AT)`
  width: 100%;
  text-align: center;
  display: inline-block;
  margin-bottom: 30px;
  color: ${palette('text', 1)};
  text-transform: uppercase;
  font-weight: 600;
`

export const PasswordInput = styled(A.Form.Item)`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  margin-bottom: 20px !important;
`

export const Content = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 45px 30px 35px 30px;
  background-color: ${palette('background', 1)};

  ${media.sm`
    padding: 90px 60px 70px 60px;
  `}
`

export const Actions = styled('div')`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  width: 100%;

  ${media.sm`
    flex-direction: row;
  `}
`

export const Button = styled(BaseButton)`
  margin-bottom: 20px;
  width: 100%;

  &:last-child {
    margin-bottom: 0;
  }

  ${media.sm`
    margin-bottom: 0;
    width: auto;
    max-width: 200px;
  `}
`
