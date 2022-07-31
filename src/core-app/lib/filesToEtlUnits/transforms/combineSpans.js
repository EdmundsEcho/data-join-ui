import { spansUnion } from './span/spanSetOps';
import { propFromSources } from '../etl-field-helper';
import { LevelsError } from '../../LuciErrors';

/* eslint-disable no-console */

/**
 *
 *    :: sources -> top-level prop
 *
 *
 * @function
 * @return {Array}
 *
 */
export const combineSpans = (sources) => {
  try {
    const props = propFromSources('levels-mspan')(sources);
    if (
      props.reduce(
        (combinedSpans, prop) =>
          combinedSpans || typeof prop === 'undefined' || prop === null,
        false,
      )
    ) {
      throw new LevelsError(
        'Error: combineSpans applied to sources with a missing span property.',
      );
    }
    return spansUnion(props);
  } catch (e) {
    if (e instanceof LevelsError) {
      console.warn(e.message);
      return [];
    }
    throw e;
  }
};

export default combineSpans;
