import { AssetRuneNative } from '@xchainjs/xchain-util'
import styled from 'styled-components'

import { media } from '../../helpers/styleHelper'
import { AssetIcon as UIAssetIcon } from '../uielements/assets/assetIcon'
import { Label as UILabel } from '../uielements/label'

// import { palette } from 'styled-theme'
// import { Tabs as TabsBase } from '../tabs/Tabs'

export const Container = styled('div')`
  min-height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`

export const Header = styled('div')``

export const HeaderContent = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;

  ${media.sm`
    justify-content: flex-start;
    flex-direction: row;
    padding: 30px 30px 150px;
  `}
`

export const AssetIcon = styled(UIAssetIcon).attrs({ asset: AssetRuneNative, size: 'large' })`
  margin-bottom: 10px;
  ${media.sm`
    margin: 0 25px 0 0;
  `}
`

export const HeaderTitle = styled(UILabel).attrs({ weight: 'bold' })`
  text-transform: uppercase;
  font-size: 24px;
  padding: 0;
  line-height: 1em;
  margin-bottom: 10px;
  text-align: center;

  ${media.sm`
    font-size: 36px;
    text-align: left;
  `}
`
export const HeaderSubtitle = styled(UILabel).attrs({ weight: 'bold' })`
  font-size: 18px;
  text-transform: uppercase;
  padding: 0;
  line-height: 1em;
  text-align: center;

  ${media.sm`
    font-size: 24px;
    text-align: left;
  `}
`
