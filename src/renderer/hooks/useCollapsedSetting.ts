import { useCallback } from 'react'

import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { useAppContext } from '../contexts/AppContext'
import { SettingType } from '../services/app/types'

/**
 * Hook to set/update state of collapsed settings
 *
 * Note: Same rule as we have for services - Use this hook in top level *views only (but not for components)
 */
export const useCollapsedSetting = (setting: SettingType): { collapsed: boolean; toggle: FP.Lazy<void> } => {
  const { collapsedSettings$, toggleCollapsedSetting } = useAppContext()

  const [collapsed] = useObservableState(
    () =>
      FP.pipe(
        collapsedSettings$,
        RxOp.map((settings) => settings[setting])
      ),
    true // collapsed === closed by default
  )

  const toggle = useCallback(() => toggleCollapsedSetting(setting), [setting, toggleCollapsedSetting])

  return { collapsed, toggle }
}
