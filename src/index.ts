import { register9R } from './shared/api/ninerealms'

// needed by CRA (can't be overridden by craco)
// see https://github.com/gsoft-inc/craco/issues/66#issuecomment-455202361
import './renderer/index'

register9R()
