Rollups are reusable grouping functions that are referenced throughout the application. The left values (lvalues) are distinct.

We suggest pre-existing groups in hopes that the user will not create multiple instances of the same group with varying spellings etc.

```jsx
import Rollup from './index.jsx';

const values = {'value1': null};
const groups = [ 'group1', 'group2' ];

<Rollup values={values} groups={groups} />
```