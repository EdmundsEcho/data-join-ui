// prop collections

import React, {useState} from 'react'
import {Switch} from '../switch'

const Toggle = (props) => {
  const [state, setState] = useState({on: false})
  const toggle = () => setState(({on}) => ({on: !on}))
  const getStateAndHelpers = () => {
    return {
      on: state.on,
      toggle: toggle,
      // In our last usage example, you'll notice that we had some
      // common props (`onClick`, and we're also missing `aria-pressed`
      // value on the `button`). Because most users will want these
      // props applied to the button they render, we can add a collection
      // of props as a convenience for them.
      //
      // 🐨 Add a `togglerProps` object that has an `aria-pressed` (should
      // be set to the value of the `on` state), and an `onClick` assigned
      // to the toggle function.
      togglerProps: {
        onClick: toggle,
        'aria-pressed': state.on,
      },
    }
  }
  return props.children(getStateAndHelpers())
}

// Don't make changes to the Usage component. It's here to show you how your
// component is intended to be used and is used in the tests.
// You can make all the tests pass by updating the Toggle component.
function Usage({
  onToggle = (...args) => console.log('onToggle', ...args),
}) {
  return (
    <Toggle onToggle={onToggle}>
      {({on, togglerProps}) => (
        <div>
          <Switch on={on} {...togglerProps} />
          <hr />
          <button aria-label="custom-button" {...togglerProps}>
            {on ? 'on' : 'off'}
          </button>
        </div>
      )}
    </Toggle>
  )
}
Usage.title = 'Prop Collections'

export {Toggle, Usage as default}
