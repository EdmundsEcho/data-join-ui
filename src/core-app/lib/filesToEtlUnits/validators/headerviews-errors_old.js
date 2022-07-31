/**
 * @module /lib/filesToEtlUnits/validators/headerviews-errors
 *
 * @description
 * Reviews a headerView in context of the other headerViews.
 * Generates errors organized by filename.
 *
 * { path1: [ 'error' ], path2: ['error'] }
 *
 */
import * as H from '../headerview-helpers';
// import { validateField } from './validations';

/**
 * @function
 * @param {headerViews} Array of non-validated hvs
 * @param {hvsErrors} Map collection of errors from validated hvs
 * @return {hvsErrors} Map path: [ 'error' ], path: ['error']
 */
const reportHvErrors = ({ hv, priorHvsErrors = {} }) => {
  console.debug('v2');
  console.dir(priorHvsErrors);

  const hvErrors = H.getActiveHvFields(hv);

  return hvErrors.length === 0
    ? priorHvsErrors
    : {
        ...priorHvsErrors,
        [hv.filename]: [
          ...new Set([...hvErrors, ...(priorHvsErrors[hv.filename] || [])]),
        ],
      };
};

export default reportHvErrors;
