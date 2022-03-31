import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../helpers/styleHelper'
import { Label as UILabel } from '../../uielements/label'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: cemter;
  padding: 20px 10px 30px 20px;
  background-color: ${palette('background', 1)};
`

export const BalanceTitle = styled(UILabel)`
  padding: 0 4px;
  font-size: 9px;
  text-transform: uppercase;
  color: ${palette('gray', 2)};
  width: auto;
  text-align: center;

  ${media.sm`
  font-size: 11px;
  `}

  ${media.lg`
  font-size: 13px;
  `}
`

export const BalanceLabel = styled(UILabel)`
  font-size: 27px;
  line-height: 100%;
  padding: 0 10px;
  /* width: auto; */
  text-align: center;

  ${media.sm`
  font-size: 41px;
  `}

  ${media.lg`
  font-size: 54px;
  `}
`

export const BalanceError = styled(UILabel).attrs({
  color: 'error'
})`
  text-transform: uppercase;
  font-size: 11px;
  line-height: 100%;
  padding: 5px;
  width: auto;
  text-align: center;

  ${media.sm`
  font-size: 14px;
  `}
`
