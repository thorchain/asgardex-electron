import React from 'react'
import { Route, Switch } from 'react-router-dom'
import ContentA from './content/ContentA'
import ContentB from './content/ContentB'
import NoContent from './content/NoContent'
import { contentARoute, contentBRoute } from './routes'

const AppContent: React.FC<{}> = (): JSX.Element => {
  return (
    <Switch>
      <Route path={contentARoute.template} exact>
        <ContentA />
      </Route>
      <Route path={contentBRoute.template} exact>
        <ContentB />
      </Route>
      <Route path="*">
        <NoContent />
      </Route>
    </Switch>
  )
}

export default AppContent
