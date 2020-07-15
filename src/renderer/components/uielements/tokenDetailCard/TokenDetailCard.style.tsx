import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../helpers/styleHelper'
import Label from '../label'

export const TokenDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 20px;
  padding-top: 30px;
  height: 100%;
  background: ${palette('background', 1)};
  box-shadow: 0px 1px 3px ${palette('gray', 1)};
  border-radius: 3px;
  ${media.sm`
    padding-top: 10px;
  `}
`

export const TitleLabel = styled(Label)`
  padding-bottom: 0;
  letter-spacing: 2.5px;
`

export const NewTokenDetailWrapper = styled.div`
  width: 90%;
  ${media.sm`
    width: 70%;
  `}
  height: 300px;
  padding: 30px;
  margin-top: 60px;
  margin-bottom: 30px;
  border: 1px solid ${palette('gray', 0)};
`

export const NewTokenCoin = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: -50px;
`
export const TokenName = styled(Label)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
`
