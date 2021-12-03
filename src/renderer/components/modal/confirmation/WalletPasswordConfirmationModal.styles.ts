import styled from 'styled-components'

import { ReactComponent as WalletIconSVG } from '../../../assets/svg/icon-wallet.svg'
import { media } from '../../../helpers/styleHelper'

export const Content = styled.div`
  display: flex;
  flex-direction: column;
`

export const WalletIconContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const WalletIcon = styled(WalletIconSVG)`
  width: 20%;
  height: 20%;
  align-self: center;
  & > * {
    fill: #cccccc;
  }

  ${media.md`
  width: 30%;
  height: 30%;
  `}
`

export const Description = styled.p`
  font-family: 'MainFontRegular';
  font-size: 12;
  text-align: center;
`
