import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'

import App from './App.PlayNest.jsx'

const Root = () => {
  return (
    <SnackbarProvider maxSnack={3}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SnackbarProvider>
  )
}
ReactDOM.render(<Root />, document.getElementById('root'))

// use-query-params adapter for React Router 6
/*
const RouteAdapter = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const adaptedHistory = React.useMemo(
    () => ({
      replace(location) {
        navigate(location, { replace: true, state: location.state })
      },
      push(location) {
        navigate(location, { replace: false, state: location.state })
      },
    }),
    [navigate],
  )
  return children({ history: adaptedHistory, location })
}
*/
