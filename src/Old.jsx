/**
 * WIP 🚧 4 states
 *
 * 1. floating button
 * 2. list of mini-cards
 * 3. larger-cards
 * 4. largest-card + list
 *
 * May wish to generalize the messaging
 * -> N choices in controller : 1 main view
 * -> Customizable components for each state
 *
 */
function WithViewController(props) {
  const {
    list: listProp,
    lookupBy /* e.g., projectId */,
    children: child,
  } = props

  const [newConfig, _setNewChildProp] = useState({
    [lookupBy]: undefined,
  })
  // only set the value; the key remains fixed
  // 👍 avoids having to track which key (child prop), to set
  const setSelectedItem = useCallback(
    (childId) => _setNewChildProp({ [lookupBy]: childId }),
    [],
  )

  console.assert(
    React.Children.count(child) === 1,
    `Only render a single child; not: ${child.length}`,
  )
  console.assert(
    React.isValidElement(child),
    `The child is not a valid React element`,
  )

  const [list, setList] = useState(listProp || listProjects)

  // 1️⃣  List of summary views;
  // ✅ a list item must include the id used to retrieve the detailed view
  // json -> List content
  //
  // ⚠️  The detail view must specify what to render when id is undefined
  //
  useEffect(() => {
    setList(list)
    if (list.length > 0) {
      console.assert(
        lookupBy in list[0],
        `The items are missing the key: ${lookupBy}`,
      )
    }
  }, [list, lookupBy])
  // referenced values in the closure (thus, when must be updated)

  // 2️⃣  Called when the user selects an item in the controller
  const handleSelect = (itemId) => () => {
    // when user clicks, the local state is updated,
    // ... this will call useEffect (() => {},[itemId])
    // clone the child with a new prop value (forcing child to re-render)
    console.log(`✅ Received on click for item: ${itemId}`)
    console.log('👉 Clone the child with new prop')
    setSelectedItem(itemId)
    // cloneChildWithNewLookupKey(_newConfig)
  }

  const RenderDetailedView = () =>
    React.cloneElement(
      child, // what will be cloned
      newConfig, // will overwrite props with same name, or create new props
    )

  if (DEBUG) {
    try {
      console.debug(`Controller settings`)
      const listItemKeys = Object.keys(list[0])
      const config = {
        'number of items': list.length,
        'lookup by key': lookupBy,
        'item keys': listItemKeys,
        [listItemKeys.includes(lookupBy) ? '✅ key' : '🚫 key']:
          'includes lookupBy',
        [React.isValidElement(child) ? '✅ child' : '🚫 child']:
          'valid child element',
      }
      console.dir(config)
    } catch (e) {
      console.debug('Could not construct the controller config')
      console.error(e)
      return null
    }
  }

  return (
    <div className="main-controller-root nostack">
      <div className="main-controller">
        <div className="main-controller inner stack box">
          <div className="box">
            <h3>Optional controller</h3>
            <p>Wrapper around any component</p>
          </div>
          {/* ⬜ use a custom summary component from props */}
          {/* ⬜ change onClick to handleSelect; can be any number of ways
                 of clicking prior to when exactly the user intends
                 to load a project */}
          {list.map(({ [lookupBy]: itemId, name }) => (
            <div
              key={`card-${itemId}`}
              className="project-mini-card box"
              onClick={handleSelect(itemId)}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
      <div className="main-view inner">
        <div className="main-view sizing-frame stack">
          {<RenderDetailedView />}
        </div>
      </div>
    </div>
  )
}
WithViewController.propTypes = {
  listProp: PropTypes.array,
  lookupBy: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}
WithViewController.defaultProps = {
  list: undefined,
}
function WithViewControllerV2(props) {
  const {
    list: listProp,
    lookupBy /* e.g., projectId */,
    children: child,
  } = props

  return (
    <div className="main-controller-root nostack">
      <div className="main-controller">
        <div className="main-controller inner stack box">
          <div className="box">
            <h3>v2 - Optional controller</h3>
            <p>Wrapper around any component</p>
          </div>
          <Routes>
            <Route
              path=":projectId"
              element={
                <div className="main-view inner">
                  <div className="main-view sizing-frame stack">
                    <ProjectView />
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  )
}
WithViewController.propTypes = {
  listProp: PropTypes.array,
  lookupBy: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}
WithViewController.defaultProps = {
  list: undefined,
}
