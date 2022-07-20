import { VisibilityOff, Visibility } from '@mui/icons-material'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { useState } from 'react'

const LuciInput = (props) => {
  const { password } = props
  const [visibility, setVisibility] = useState(!password)

  return (
    <TextField
      variant="outlined"
      margin="normal"
      type={visibility ? 'text' : 'password'}
      InputLabelProps={{
        shrink: true,
      }}
      {...props}
      InputProps={{
        endAdornment: password && (
          <InputAdornment position="end">
            <IconButton
              aria-label="Toggle password visibility"
              onClick={() => setVisibility(!visibility)}
            >
              {visibility ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  )
}

export default LuciInput
