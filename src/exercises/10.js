// control props

import React from 'react'
import {Switch} from '../switch'

// Here we're going to simplify our component slightly so you
// can learn the control props pattern in isolation from everything else.
// Next you'll put the pieces together.

class Toggle extends React.Component {
  static defaultProps = {
    onToggle: () => {},
    onStateChange: () => {},
  }
  state = {on: false}
  // 🐨 let's add a function that can determine whether
  // the on prop is controlled. Call it `isControlled`.
  // It can accept a string called `prop` and should return
  // true if that prop is controlled
  // 💰 this.props[prop] !== undefined
  isControlled(prop) {
    // this means the prop exists in both state and props
    console.debug(
      `Is ${prop} controlled? ${this.props[prop] !== undefined}` +
        ` value: ${this.props[prop]}`,
    )
    return this.props[prop] !== undefined
  }
  // 👉 returns the combined state from
  // * this.state &
  // * this.props
  // 🚨 How solve the fact that we call onStateChange before we
  //    had a chance to update state?
  // 👍 Expand influence of state to include "allChanges"
  getState(state = this.state) {
    return Object.entries(this.state).reduce(
      (combinedState, [key, value]) => {
        if (this.isControlled(key)) {
          combinedState[key] = this.props[key]
          // 👉 on is controlled, thus value set when rendered
          // look at how we set the initial props... botOn
        } else {
          combinedState[key] = value
        }
        console.debug(
          `CombinedState does it include the on prop? ` +
            `${Object.keys(combinedState).includes('on')}` +
            ` value: ${combinedState['on']}`,
        )
        return combinedState
      },
      {},
    )
  }
  // 👍 Expand influence of state to include "allChanges"
  //
  // 🚧 Note: the design seed
  // 1. this.setState(changes, callback)
  // 2. substitute changes with a function (state) => {...}:change
  //  state => { ... return unControlledChanges }
  internalSetState(changes, callback) {
    let allChanges
    this.setState(
      (state) => {
        const combinedState = this.getState(state)
        // note:  note how we use the state provided to us.
        // This requires changing the getState function.
        // See the new arg.

        const changesObject =
          typeof changes === 'function'
            ? changes(combinedState)
            : changes

        allChanges = changesObject

        const unControlledChanges = Object.entries(
          changesObject,
        ).reduce((newChanges, [key, value]) => {
          if (!this.isControlled(key)) {
            newChanges[key] = value
          }
          return newChanges
        }, {})

        console.debug(
          "uncontrolled changes; it should not include 'on'?",
          unControlledChanges,
        )
        // 💰 Avoid a re-render when there are no changes
        // of controlled components
        return Object.keys(unControlledChanges).length
          ? unControlledChanges
          : null
      },
      () => {
        // 🟢 This is where we start
        // 🏁 🚨 Called *before* the state had a chance to update.
        // 💰 give the user access to setState
        this.props.onStateChange(allChanges, this.getState()) // broken
        // this.props.onStateChange(allChanges, this.getState())
        // 👍 this.getState needs to change to allChanges
        // 👍 allChanges includes the recommendation specified in the
        //    toggle internalSetState callback where we set it to on.
        callback()
      },
    )
  }
  //
  // 🐨 Now let's add a function that can return the state
  // whether it's coming from this.state or this.props
  // Call it `getState` and have it return on from
  // state if it's not controlled or props if it is.
  toggle = () => {
    // 🐨 if the toggle is controlled, then we shouldn't
    // be updating state. Instead we should just call
    // `this.props.onToggle` with what the state should be
    this.internalSetState(
      ({on}) => ({on: !on}),
      () => {
        this.props.onToggle(this.state.on)
      },
    )
  }
  render() {
    // 🐨 rather than getting state from this.state,
    // let's use our `getState` method.
    return <Switch on={this.getState().on} onClick={this.toggle} />
  }
}

// These extra credit ideas are to expand this solution to elegantly handle
// more state properties than just a single `on` state.
// 💯 Make the `getState` function generic enough to support all state in
// `this.state` even if we add any number of properties to state.
// 💯 Add support for an `onStateChange` prop which is called whenever any
// state changes. It should be called with `changes` and `state`
// 💯 Add support for a `type` property in the `changes` you pass to
// `onStateChange` so consumers can differentiate different state changes.

// Don't make changes to the Usage component. It's here to show you how your
// component is intended to be used and is used in the tests.
// You can make all the tests pass by updating the Toggle component.
class Usage extends React.Component {
  state = {bothOn: false}
  handleStateChange = (props) => {
    const {on} = props
    console.debug('The child props', props)
    console.debug('The on value in the child', on)
    this.setState({bothOn: on})
    // 🚨 When is onStateChange called?
    // 🚨 ... when bothOn is false; *before* we had a change to udpate state.
  }
  render() {
    const {bothOn} = this.state
    return (
      <div>
        <Toggle on={bothOn} onStateChange={this.handleStateChange} />
        <Toggle on={bothOn} onStateChange={this.handleStateChange} />
        {/* 👉 bothOn gets updated when handleStateChange is called */}
        {/* 👉 handleStateChange is called when onStateChange is called */}
      </div>
    )
  }
}
Usage.title = 'Control Props'

export {Toggle, Usage as default}
