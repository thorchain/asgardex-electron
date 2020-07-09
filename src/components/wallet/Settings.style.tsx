import { Divider, Row, Col, Card, List } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import Button from '../uielements/button'
import Label from '../uielements/label'

export const StyledTitleWrapper = styled.div`
  margin: 0px -8px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${palette('background', 1)};
  min-height: 70px;
`

export const StyledTitle = styled(Label)`
  color: ${palette('text', 1)};
  text-transform: uppercase;
  font-family: 'MainFontRegular';
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
`

export const StyledDivider = styled(Divider)`
  margin: 0;
  border-top: 1px solid ${palette('gray', 0)};
`

export const StyledSubtitle = styled(Label)`
  margin: 10px 0px;
  color: ${palette('text', 0)};
  text-transform: uppercase;
  font-family: 'MainFontRegular';
  font-weight: 600;
  font-size: 18px;
`

export const StyledRow = styled(Row)`
  padding: 10px 30px;
  background-color: ${palette('background', 1)};

  .ant-row {
    margin: 0;
  }
`

export const StyledWalletCol = styled(Col)`
  width: 100%;
`

export const StyledCard = styled(Card)`
  border-radius: 5px;
  background-color: ${palette('background', 1)};
  border: 1px solid ${palette('gray', 0)};
`

export const StyledOptionCard = styled(Card)`
  .ant-card-body {
    padding: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${palette('background', 1)};
    width: 100%;
  }
`

export const StyledOptionLabel = styled(Label)`
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  font-size: 14px;
  font-family: 'MainFontRegular';
  min-height: 38px;
`

export const StyledButton = styled(Button)`
  font-family: 'MainFontRegular';
  text-transform: uppercase;

  span {
    font-size: 14px;
  }
`

export const StyledPlaceholder = styled(Label)`
  display: block;
  padding: 0px;
  color: ${palette('text', 2)};
  font-family: 'MainFontRegular';
  font-size: 14px;
  text-transform: uppercase;
`

export const StyledClientLabel = styled(Label)`
  display: block;
  padding-top: 0px;
  color: ${palette('text', 1)};
  font-family: 'MainFontRegular';
  font-size: 16px;
  text-transform: uppercase;
`

export const StyledClientButton = styled(Label)`
  font-family: 'MainFontRegular';
  text-transform: uppercase;
`

export const StyledAccountCard = styled(Card)`
  border: 1px solid ${palette('gray', 0)};

  .ant-card-body {
    padding: 0;
    background-color: ${palette('background', 1)};

    div > div > div > ul > li {
      border-bottom: 1px solid ${palette('gray', 0)};
    }
  }
`

export const StyledListItem = styled(List.Item)`
  padding: 20px 20px 0;
  flex-direction: column;
  align-items: start;
  border: none;
  border-bottom: 1px solid ${palette('gray', 0)};

  .ant-list-item {
    border-bottom: 1px solid ${palette('gray', 0)};
  }
`

export const StyledChainName = styled(Label)`
  padding: 0px;
  text-transform: uppercase;
  font-weight: normal;
  font-size: 18px;
  line-height: 25px;
  letter-spacing: 2px;
`

export const StyledChainContent = styled.div`
  margin-left: 30px;
  margin-top: 10px;
  width: 100%;
`

export const StyledAccountPlaceholder = styled(Label)`
  display: block;
  padding: 0px;
  color: ${palette('text', 2)};
  font-family: 'MainFontRegular';
  font-size: 12px;
  text-transform: uppercase;
`

export const StyledAccountContent = styled(Label)`
  display: flex;
  align-items: center;
  padding: 0px;
  color: ${palette('text', 1)};
`

export const StyledAccountAddress = styled(Label)`
  display: inline-block;
  width: calc(70%);
  white-space: nowrap;
  overflow: hidden;
  font-family: 'MainFontRegular';
  font-size: 16px;
  text-overflow: ellipsis;
  text-transform: uppercase;
`

export const StyledDeviceText = styled(Label)`
  padding: 0 0 10px;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 16px;
  font-family: 'MainFontRegular';

  span {
    margin-right: 10px;
  }
`
