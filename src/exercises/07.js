// State Initializers

import React, {useState, useEffect} from 'react'
import {Switch} from '../switch'

const callAll = (...fns) => (...args) =>
  fns.forEach((fn) => fn && fn(...args))

const Toggle = (props) => {
  // 🐨 We're going to need some static defaultProps here to allow
  // people to pass a `initialOn` prop.
  const {initialOn, onReset} = props
  Toggle.defaultProps = {
    initialOn: false,
    onReset: () => {},
  }

  console.log('props', props)

  // 🐨 Rather than initializing state to have on as false,
  // set on to this.props.initialOn
  const initialState = {on: initialOn}
  const [state, setState] = useState(initialState)

  // 🐨 now let's add a reset method here that resets the state
  // to the initial state. Then add a callback that calls
  // this.props.onReset with the `on` state.
  const reset = () => {
    setState(initialState)
  }
  useEffect(() => {
    if (state.on !== initialState.on) {
      console.log('reset effect called')
      onReset(state.on)
    } else {
      console.log('reset effect skipped')
    }
  })

  const toggle = () => setState(({on}) => ({on: !on}))
  useEffect(() => {
    console.log('toggle effect called')
    props.onToggle(state.on)
  })

  const getTogglerProps = ({onClick, ...props} = {}) => {
    return {
      'aria-pressed': state.on,
      onClick: callAll(onClick, toggle),
      ...props,
    }
  }
  const getStateAndHelpers = () => {
    return {
      on: state.on,
      toggle: toggle,
      // 🐨 now let's include the reset method here
      // so folks can use that in their implementation.
      reset: reset,
      getTogglerProps: getTogglerProps,
    }
  }
  return props.children(getStateAndHelpers())
}

// Don't make changes to the Usage component. It's here to show you how your
// component is intended to be used and is used in the tests.
// You can make all the tests pass by updating the Toggle component.
function Usage({
  initialOn = true,
  onToggle = (...args) => console.log('onToggle', ...args),
  onReset = (...args) => console.log('onReset', ...args),
}) {
  return (
    <Toggle
      initialOn={initialOn}
      onToggle={onToggle}
      onReset={onReset}
    >
      {({getTogglerProps, on, reset}) => (
        <div>
          <Switch {...getTogglerProps({on})} />
          <hr />
          <button onClick={() => reset()}>Reset</button>
        </div>
      )}
    </Toggle>
  )
}
Usage.title = 'State Initializers'

export {Toggle, Usage as default}
