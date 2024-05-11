/**
 * @module ducks/selectors/fieldSelectorCreator
 * @desc Generally, modules in this directory use multiple rootSelectors to
 * create a selector.
 */
import {
  selectFieldInHeader as selectorFileField,
  selectEtlField as selectorEtlField,
  // selectWideToLongField as selectorWideField,
} from '../rootSelectors';
import { InvalidStateError } from '../../lib/LuciErrors';
import { FIELD_TYPES } from '../../lib/sum-types';

/**
 * Creates a field selector configuration based on the specified field type.
 * @param {string} fieldType - The type of the field to create.
 * @param {function} getValue - A function to retrieve values based on keys.
 * @returns {Object} The field configuration including the selector and its properties.
 */
export const fieldSelectorCreatorCfg = (fieldType, getValue) => {
  switch (fieldType) {
    case FIELD_TYPES.ETL:
      return {
        selector: selectorEtlField,
        selectorProps: [getValue('name')],
      };

    case FIELD_TYPES.FILE:
      return {
        selector: selectorFileField,
        selectorProps: [getValue('filename'), getValue('header-idx')],
      };

    case FIELD_TYPES.WIDE:
      return {
        selector: () => new Proxy({}, { get: (_, prop) => getValue(prop) }),
        selectorProps: [],
      };

    default:
      throw new InvalidStateError(`Unsupported fieldType: ${fieldType}`);
  }
};
