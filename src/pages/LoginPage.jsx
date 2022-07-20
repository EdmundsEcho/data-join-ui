import { Box, Button, IconButton, Paper, Typography } from '@mui/material'
import { useReducer, useState } from 'react'
import { Google, GitHub, Twitter } from '@mui/icons-material'

import './LoginPage.css'
import clsx from 'clsx'

const LoginForm = ({ handleSubmit, isLoading }) => {
  const [formInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      emailAddress: '',
      password: '',
    },
  )

  return (
    <form
      className={clsx('Luci-login')}
      onSubmit={(event) => handleSubmit(event, formInput)}
    >
      <Button
        sx={{ width: '100%', mt: 3, mb: 1, height: '36px' }}
        variant="contained"
        color="primary"
        type={isLoading ? 'button' : 'submit'}
      >
        {isLoading ? <span className="spinner" /> : 'Sign In'}
      </Button>
    </form>
  )
}

const AuthButton = (props) => {
  return <IconButton {...props} className="auth-button" />
}

export const LoginPage = () => {
  const [isLoading, setLoading] = useState(false)

  // generic for supported authenticating services
  const authProviders = ['google', 'azure', 'github', 'twitter', 'discord']
  const errorMsg = 'this auth provider is not supported'
  const handleAuth = (provider) => (event) => {
    // 🚧 assert using supported auth provider
    console.assert(authProviders.includes(provider), {
      provider: provider,
      errorMsg: errorMsg,
    })

    if (event) event.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const authURL = 'http://localhost:3099/auth/' + provider
      window.location.replace(authURL)
    }, 1000)
  }

  return (
    <Box
      className="login-background"
      sx={{
        height: 'calc(100vh - 100px)',
        alignItems: 'center',
        justifyItems: 'center',
        display: 'grid',
        width: '100%',
        textAlign: 'center',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
      }}
    >
      <Box sx={{ zIndex: 2 }}>
        <Paper sx={{ p: 6, width: '300px' }}>
          <Typography variant="h5" component="h2">
            Sign in
          </Typography>
          <Box
            sx={{
              mb: 1,
              mt: 1,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <AuthButton onClick={handleAuth('google')} disabled={isLoading}>
              <Google />
            </AuthButton>
            <AuthButton onClick={handleAuth('discord')} disabled={isLoading}>
              <span
                className="iconify"
                data-icon="akar-icons:discord-fill"
              ></span>
            </AuthButton>
            <AuthButton onClick={handleAuth('azure')} disabled={isLoading}>
              <span className="iconify" data-icon="mdi:microsoft-azure"></span>
            </AuthButton>
            <AuthButton onClick={handleAuth('github')} disabled={isLoading}>
              <GitHub />
            </AuthButton>
            <AuthButton onClick={handleAuth('twitter')} disabled={isLoading}>
              <Twitter />
            </AuthButton>
          </Box>
          <LoginForm
            handleSubmit={handleAuth('google')}
            isLoading={isLoading}
          />
        </Paper>
      </Box>
    </Box>
  )
}

export default LoginPage
