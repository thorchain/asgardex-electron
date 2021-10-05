import { CaretDownOutlined as CaretDownOutlinedUI } from '@ant-design/icons'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const DropdownSelectorWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px solid ${palette('primary', 0)};
  border-radius: 5px;
  padding: 10px;
`

export const WalletAddress = styled.div`
  margin: 5px 15px 5px 20px;
  color: ${palette('text', 2)};
`

export const TruncatedAddress = styled.div`
  margin: 5px 15px 5px 10px;
  font-size: 15px;
  color: ${palette('primary', 0)};
`

export const CaretDownOutlined = styled(CaretDownOutlinedUI)`
  margin-left: 5px;
  padding: 5px;
  color: ${palette('primary', 0)};
`

export const MenuItemWrapper = styled.div`
  display: flex;
  flex: row;
  align-items: center;
`
