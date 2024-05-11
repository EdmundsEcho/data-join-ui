# The states in the state-machine

## Building states

There are two sets of parallel states: `BUILDING_REQUEST` and `BUILDING_ANTIREQUEST` (requestType).

## Meta parallel states: computation type

The second set: `REDUCE`, `SERIES`, `SELECT`, `EMPTY` (`computationType`). `EMPTY` is the initial state until the machine reads the initialization values.

### Transition between states

The transition between REDUCE_REQUEST and SERIES_REQUEST states occurs when an event type occurs: MAKE_REDUCE { value: bool }. When value is true we change to REDUCE_REQUEST, and vice-versa when false. When we transition between these states, the machine's context should change the `requestType` to REDUCE or SERIES.

#### Computation type: SELECT

The SELECT is set when the initializing event with the payload
`etlUnitType === 'quality'`. It cannot be moved from this state (it's a final
state).

If `etlUnitType !== 'quality'`, look for the `computationType: REDUCE | SERIES` in the initializing event.

### Transition between Building states

Regarding how the machine responds to events when in either the BUILDING_REQUEST or BUILDING_ANTIREQUEST. The default, initial state is BUILDING_REQUEST.

There are two external events:

1. `onRowClick` with a payload of

```js
{ id: string, level: string, isSelected: bool }
```

2. and `onToggleAll` with a payload

```js
{
  isSelected: bool;
}
```

This latter event means "I want all values" or "I want no values". Thus when the onToggleAll isSelected:true, we move to the BUILDING_REQUEST state, and vice-versa when `isSelected` is false.

## The context

The context hosts a `selectionModel`.

```json
{
  "totalRowCount": "number",
  "requestType": "REQUEST | ANTIREQUEST",
  "values": {
    "__ALL__": {
      "value": "__ALL__",
      "request": "bool"
    },
    "value": {
      "value": "string",
      "request": "bool"
    }
  },
  "computationType": "SERIES | REDUCE | SELECT"
}
```

The `__ALL__` entry has a request: true when `requestType` is REQUEST, and false when ANTIREQUEST.
The former means "I want all values", the latter means "I want no values".

The subsequent keys in the selectionModel request prop are qualifiers to the starting point set by **ALL**. They work as follows. Assuming the parallel state is in SELECT. When the machine is in the BUILDING_REQUEST state,

1. initial state, and when `onToggleAll `isSelected` true`, and when `values.keys length - 1 === totalRowCount` while in the BUILDING_ANTIREQUEST state ("I want no values except all values" MEANS the user wants all values).

```js
{
    requestType: 'REQUEST',
    computationType: 'SELECT',
    values: { __ALL__: { value: '__ALL__', request: true } },
    totalRowCount: 10
}
```

2. starting from 1, the user clicks on a row to deselect `valueToggle1 (isSelected === false)`. This reads "I want all values except valueToggle1".

```js
{ requestType: 'REQUEST', computationType: 'SELECT', request: { __ALL__: { value: '__ALL__', request: true }, valueToggle1: { value: 'valueToggle1', request: false } }, totalRowCount: 10 }
```

3. starting from 2, the user clicks on the row to select `valueToggle1 (isSelected === true)`:

```js
{ requestType: 'REQUEST', computationType: 'SELECT', request: { __ALL__: { value: '__ALL__', request: true } }, totalRowCount: 10 }
```

In contrast, when the machine is in the BUILDING_ANTIREQUEST state,

1. when ` onToggleAll isSelected false``, and when  `values.keys length - 1 === totalRowCount`while in the`BUILDING_REQUEST` state ("I want all values except all values" MEANS the user wants no values).

```js
{ requestType: 'ANTIREQUEST', computationType: 'SELECT', request: { __ALL__: { value: '__ALL__', request: false } }, totalRowCount: 10 }
```

2. starting from 1, the user clicks on a row to select `valueToggle2 (isSelected === true)`. This reads "I want no values except valueToggle2".

```js
{ requestType: 'ANTIREQUEST', computationType: 'SELECT', request: { __ALL__: { value: '__ALL__', request: false }, valueToggle2: { value: 'valueToggle2', request: true } }, totalRowCount: 10 }

```

3. starting from 2, the user clicks on a row to deselect `valueToggle2`

```js
{ requestType: 'ANTIREQUEST', computationType: 'SELECT', request: { __ALL__: { value: '__ALL__', request: false } }, totalRowCount: 10 }
```

The initial values of the `selectionModel` are:

```js
{
  totalRowCount: 'number', // depends on initialization
  requestType: 'REQUEST', // default when not REDUCE
  computationType: 'SELECT | REDUCE | SERIES', // depends on initialization
  values: { __ALL__: { value: '__ALL__', request: 'bool' } },
};
```

... so we start in the BUILDING_REQUEST state.

The initial state of `requestType` I suppose will need to be `EMPTY` until we read the initialization values. The system will need to monitor the selectionModel to determine when the state needs to switch from a `REQUEST` to an `ANTIREQUEST` state.

This verification can be done after each onRowClick event. As stated already, when

```js
values.keys length - 1 === totalRowCount
```

...while in the BUILDING_REQUEST state ("I want all values except all values" MEANS the user wants no values), the state needs to transition to BUILDING_ANTIREQUEST with the selection model entries

```js
values: requestType: ANTIREQUEST,
request: { __ALL__: { value: '__ALL__', request: false } },
```

In contrast, when

```js
request.keys length - 1 === totalRowCount
```

while in the BUILDING_ANTIREQUEST state ("I want no values except all values" MEANS the user wants all values), the state needs to transition to BUILDING_REQUEST with the selection model entries:

```js
requestType: REQUEST,
values: { __ALL__: { value: '__ALL__', request: true } },
```

Finally, the external event `onToggleAll` with a payload `{ isSelected: bool }` will have the machine restart from either of these request all states depending on the `isSelected` value true, move to BUILDING_REQUEST when in BUILDING_ANTIREQUEST and set the selection model entries

```js
requestType: REQUEST,
values: { __ALL__: { value: '__ALL__', request: true } }
```

move to BUILDING_ANTIREQUEST when in BUILDING_REQUEST and set the selection model entries

```js
requestType: ANTIREQUEST,
values: { __ALL__: { value: '__ALL__', request: false } }
```

Finally, after each update to the machine's context I would like to dispatch an event called `dispatchContext` with the `selectionModel` as a payload.
