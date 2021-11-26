import styled from 'styled-components'

import { AddressEllipsis as UIAddressEllipsis, Props as UIAddressEllipsisProps } from '../../addressEllipsis'
import { Label as UILabel, LabelProps as UILabelProps } from '../../label'
import { Size as UIAssetIconSize, FontSizes } from '../assetIcon'

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
`
const fontSizes: FontSizes = {
  large: 21,
  big: 19,
  normal: 16,
  small: 14,
  xsmall: 11
}

type AddressLabelProps = UILabelProps & { iconSize: UIAssetIconSize }
export const AddressLabel = styled(UILabel)<AddressLabelProps>`
  font-size: ${({ iconSize }) => `${fontSizes[iconSize]}px`};
  padding-left: 5px;
`

export const AddressWrapper = styled.div`
  overflow: none;
  width: 100%;
`

type AddressEllipsisProps = UIAddressEllipsisProps & { iconSize: UIAssetIconSize }
export const AddressEllipsis = styled(UIAddressEllipsis)<AddressEllipsisProps>`
  font-size: ${({ iconSize }) => `${fontSizes[iconSize]}px`};
  padding-left: 5px;
  text-transform: none;
`
