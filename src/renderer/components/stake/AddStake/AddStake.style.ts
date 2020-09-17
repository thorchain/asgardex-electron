import styled from 'styled-components'
import { key } from 'styled-theme'

import { media } from '../../../helpers/styleHelper'
import BaseAssetCard from '../../uielements/assets/assetCard'

export const Container = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 100%;
`

export const InputsWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: ${key('sizes.gutter.vertical', 0)};

  ${media.md`
    flex-direction: row;
    justify-content: center;
    margin-bottom: calc(2 * ${key('sizes.gutter.vertical', '0px')});
  `}
`

export const AssetCard = styled(BaseAssetCard)`
  width: 100%;
  margin: 0 0 ${key('sizes.gutter.vertical', 0)} 0;

  ${media.md`
    margin: 0 ${key('sizes.gutter.vertical', 0)} 0 0;
    width: 365px;
  `}

  &:last-child {
    margin: 0;
  }
`
