// English (Global)
// Antd Internationalization https://2x.ant.design/docs/react/i18n
import antdData from 'antd/lib/locale-provider/en_GB'

import { Messages } from '../types'
import common from './common'
import pools from './pools'
import wallet from './wallet'

export default { ...antdData, ...common, ...pools, ...wallet } as Messages
