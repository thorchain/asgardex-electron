import { CaretDownOutlined as CaretDownOutlinedUI } from '@ant-design/icons'
import styled from 'styled-components'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { palette } from 'styled-theme'

export const DropdownSelectorWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px solid red;
  border-radius: 5px;
  padding: 10px;
`

export const WalletAddress = styled.div`
  margin: 5px;
`

export const TruncatedAddress = styled.div`
  margin: 5px;
`

export const CaretDownOutlined = styled(CaretDownOutlinedUI)`
  padding: 5px;
`

export const MenuItemWrapper = styled.div`
  display: flex;
  flex: row;
  align-items: center;
`
