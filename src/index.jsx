import React from 'react'
import ReactDOM from 'react-dom'
import {
  BrowserRouter,
  useNavigate,
  useLocation,
} from 'react-router-dom'
import {QueryParamProvider} from 'use-query-params'

import App from './App.PlayNest.jsx'

const RouteAdapter = ({children}) => {
  const navigate = useNavigate()
  const location = useLocation()

  const adaptedHistory = React.useMemo(
    () => ({
      replace(location) {
        navigate(location, {replace: true, state: location.state})
      },
      push(location) {
        navigate(location, {replace: false, state: location.state})
      },
    }),
    [navigate],
  )
  return children({history: adaptedHistory, location})
}

const Root = () => {
  return (
    <BrowserRouter>
      <QueryParamProvider ReactRouterRoute={RouteAdapter}>
        <App />
      </QueryParamProvider>
    </BrowserRouter>
  )
}
ReactDOM.render(<Root />, document.getElementById('root'))
