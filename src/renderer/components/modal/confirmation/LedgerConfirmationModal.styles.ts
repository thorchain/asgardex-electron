import styled from 'styled-components'

import { ReactComponent as LedgerConnectUI } from '../../../assets/svg/ledger-device-connect.svg'
import { media } from '../../../helpers/styleHelper'
import { AssetIcon as AssetIconUI } from '../../uielements/assets/assetIcon/AssetIcon'

export const LedgerContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
`

export const LedgerConnect = styled(LedgerConnectUI)`
  transform: scale(0.65, 0.65);
  ${media.md`
  transform: scale(0.85, 0.85);
  `}
`

export const AssetIcon = styled(AssetIconUI)`
  position: absolute;
  top: 20px;
  left: 180px;
  transform: scale(0.7, 0.7);

  ${media.md`
    top: 21px;
    left: 170px;
    transform: scale(0.9, 0.9);
  `}
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
`
export const Description = styled.p`
  font-family: 'MainFontRegular';
  font-size: 12;
  text-align: center;
`
