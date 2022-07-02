// render props

import React, {useState} from 'react'
import {Switch} from '../switch'

/* eslint-disable no-unused-vars */

// we're back to basics here. Rather than compound components,
// let's use a render prop!
const Toggle = (props) => {
  const [state, setState] = useState({on: false})

  const toggle = () => setState(({on}) => ({on: !on}))

  // send the children the state and how to change state
  return props.children({
    on: state.on,
    toggle: toggle,
  })
  // We want to give rendering flexibility, so we'll be making
  // a change to our render prop component here.
  // You'll notice the children prop in the Usage component
  // is a function. 🐨 So you can replace this with a call this.props.children()
  // But you'll need to pass it an object with `on` and `toggle`.
}

// default way to use the Render Props component Toggle
function CommonToggle(props) {
  return (
    <Toggle {...props}>
      {({on, toggle}) => <Switch on={on} onClick={toggle} />}
    </Toggle>
  )
}
// Don't make changes to the Usage component. It's here to show you how your
// component is intended to be used and is used in the tests.
// You can make all the tests pass by updating the Toggle component.
function Usage({
  onToggle = (...args) => console.log('onToggle', ...args),
}) {
  // build assuming we get state and callback to change state
  // ... with that information, can render whatever we want.
  // Toggle calls the children as a function with args accordingly.
  return (
    <Toggle onToggle={onToggle}>
      {({on, toggle}) => (
        <div>
          {on ? 'The button is on' : 'The button is off'}
          <Switch on={on} onClick={toggle} />
          <hr />
          <button aria-label="custom-button" onClick={toggle}>
            {on ? 'on' : 'off'}
          </button>
        </div>
      )}
    </Toggle>
  )
}
Usage.title = 'Render Props'

export {Toggle, Usage as default}
