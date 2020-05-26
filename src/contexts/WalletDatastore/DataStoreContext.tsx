import React, { createContext, useContext, useEffect } from 'react'
import { initJsStore } from './storage/idbService'


const WalletDatastoreContext = createContext<any>(null)
// const initialContext: any = { }

export const DatastoreProvider: React.FC<{children:React.ReactNode}> = ({children}): JSX.Element => {
  // here we can init the db if needed
  useEffect(() => {
    // init the db
    initJsStore()
  }, []);
  return (
    <WalletDatastoreContext.Provider value="test">{children}</WalletDatastoreContext.Provider>
  )
}
