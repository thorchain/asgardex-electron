import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../helpers/styleHelper'
import { AssetIcon as AssetIconUI } from '../assets/assetIcon'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`

export const ValuesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  text-align: left;
  ${media.md`
    margin: 0 15px 0 0;
  `}

  &:last-child {
    margin: 0;
  }
`

const CWD_SIDE_MARGIN = 10
export const ContainerWithDelimeter = styled.div`
  display: inline-block;
  position: relative;
  margin: 0 ${CWD_SIDE_MARGIN * 2}px 0 0;

  &:after {
    content: ' ';
    height: 100%;
    border-right: ${palette('gray', 2)} 1px solid;
    position: absolute;
    top: 0;
    right: -${CWD_SIDE_MARGIN}px;
  }

  &:first-child {
    margin-left: 0;
  }

  &:last-of-type {
    margin-right: 0;
    &:after {
      content: none;
      display: none;
    }
  }
`

export const InOutContainer = styled(ContainerWithDelimeter)`
  display: flex;
  /* align-items: center; */
  /* flex-direction: columns; */
  /* align-items: flex-start; */
  font-size: 12px;
  text-transform: uppercase;
  padding: 3px 5px;
  line-height: 22px;
  margin-bottom: 5px;
  background: ${palette('gray', 1)};
  color: ${palette('text', 0)};

  &:first-child {
    border-top-left-radius: 1.7rem;
    border-bottom-left-radius: 1.7rem;
    align-self: flex-start;
  }

  &:last-child {
    border-top-right-radius: 1.7rem;
    border-bottom-right-radius: 1.7rem;
  }

  ${media.md`
    font-size: 14px;
    padding: 5px 10px;
    &:after {
      content: ' ';
    }
  `}
`

export const InOutValueContainer = styled.div`
  display: flex;
  align-items: center;
`

export const InOutValue = styled(ContainerWithDelimeter)`
  white-space: nowrap;
  padding: 0 5px 0 10px;

  ${media.lg`
  padding: 0;
  `}
`

export const AssetIcon = styled(AssetIconUI)`
  margin: 0 5px 0 10px;
`

export const InOutText = styled.span`
  font-size: 14px;
  color: ${palette('text', 2)};
  text-transform: uppercase;
  margin-right: 5px;

  &:first-child {
    margin-right: 5px;
    margin-left: 5px;
  }
  &:last-child {
    margin-left: 10px;
  }

  ${media.md`
   &:first-child {
    margin-right: 10px;
    margin-left: 5px;
    }
    &:last-child {
      margin-left: 15px;
    }
  `}

  &:only-child {
    margin: 0;
  }
`

export const AdditionalInfoContainer = styled.span`
  margin-right: 10px;

  &:last-child {
    margin-right: 0;
  }

  &,
  & .label-wrapper {
    padding: 0;
    color: ${palette('gray', 2)};
    font-size: 14px;
  }
`
