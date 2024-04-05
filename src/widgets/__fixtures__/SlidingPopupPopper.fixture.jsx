import * as React from 'react';
import Box from '@mui/material/Box';
import Popper from '@mui/material/Popper';
import Fade from '@mui/material/Fade';
import Draggable from 'react-draggable';

const placement = 'top-end';

export default function SimplePopper() {
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    setOpen((prevOpen) => !prevOpen);
  };

  const canBeOpen = open && Boolean(anchorEl);
  const id = canBeOpen ? 'transition-popper' : undefined;

  return (
    <div style={{ margin: '60px', width: '200px' }}>
      <div
        className='popper-container'
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          width: '500px',
          height: '600px',
          border: '1px solid white',
        }}
      >
        <button aria-describedby={id} type='button' onClick={handleClick}>
          Toggle Popper
        </button>
        <Popper
          id={id}
          open={open}
          anchorEl={anchorEl}
          transition
          placement={placement}
        >
          {({ TransitionProps }) => (
            <Draggable>
              <Fade {...TransitionProps} timeout={350}>
                <Box sx={{ border: 1, p: 1, bgcolor: 'background.paper' }}>
                  The content of the Popper.
                </Box>
              </Fade>
            </Draggable>
          )}
        </Popper>
      </div>
    </div>
  );
}
