/**
 * Specialized selector across headerView and etlView field types.
 *
 * @param {string} fieldType
 * @param {function} getFieldValue
 * @return {Object} selector configuration
 */
import {
  addOrUpdateSymbolItem as addOrUpdateItemHeaderView,
  deleteSymbolItem as deleteItemHeaderView,
  addOrUpdateSymbolItemWideConfig as addOrUpdateItemWideConfig,
  deleteSymbolItemWideConfig as deleteItemWideConfig,
} from './actions/headerView.actions';
import {
  addOrUpdateSymbolItem as addOrUpdateItemEtlView,
  deleteSymbolItem as deleteItemEtlView,
} from './actions/etlView.actions';

import {
  selectSymbolMapHeaderView,
  selectSymbolMapEtlView,
  selectSymbolMapWideConfig,

  //
  selectFieldInHeader as selectorFileField,
  selectEtlField as selectorEtlField,
  selectWideToLongField as selectorWideField,
} from './rootSelectors';

import { InputError } from '../lib/LuciErrors';

import { FIELD_TYPES } from '../lib/sum-types';

function mapSymbolsSelector(fieldType, getFieldValue) {
  /* eslint-disable one-var */
  let selector, addOrUpdateAction, deleteAction, lookupParams;

  switch (fieldType) {
    case FIELD_TYPES.FILE:
      selector = selectSymbolMapHeaderView;
      addOrUpdateAction = addOrUpdateItemHeaderView;
      deleteAction = deleteItemHeaderView;
      lookupParams = {
        filename: getFieldValue('filename'),
        headerIdx: getFieldValue('header-idx'),
      };
      break;
    case FIELD_TYPES.WIDE:
      selector = selectSymbolMapWideConfig;
      addOrUpdateAction = addOrUpdateItemWideConfig;
      deleteAction = deleteItemWideConfig;
      lookupParams = {
        filename: getFieldValue('filename'),
        fieldAlias: getFieldValue('field-alias'),
      };
      break;
    case FIELD_TYPES.ETL:
      selector = selectSymbolMapEtlView;
      addOrUpdateAction = addOrUpdateItemEtlView;
      deleteAction = deleteItemEtlView;
      lookupParams = { fieldName: getFieldValue('name') };
      break;
    default:
      throw new InputError(`MapSymbol selector maker invalid fieldType: ${fieldType}`);
  }
  return {
    selector,
    addOrUpdateAction,
    deleteAction,
    lookupParams,
  };
}

/**
 * Another local selector from ValueGridFileLevels
 */
export const fieldNameSelector = ({ fieldType, getFieldValue: getValue }) => {
  switch (fieldType) {
    // headerView
    case FIELD_TYPES.FILE:
    case FIELD_TYPES.WIDE:
      return getValue('field-alias');

    // etlView
    case FIELD_TYPES.ETL:
      return getValue('name');

    default:
      throw new InputError(`FieldNameSelector unsupported fieldType: ${fieldType}`);
  }
};
/**
 * Local selector for the "map-symbols" prop.  map-symbols is used to
 * to scrub levels data.
 *
 * Returns a store selector. Not all branches depend on state (i.e. are
 * constant functions).
 *
 *
 * @param {FIELD_TYPES} fieldType
 * @param {function} getFieldValue
 * @returns {Object} arrows
 * @private
 */
export const mapSymbolsSelectorCreator = ({ fieldType, getFieldValue: getValue }) => {
  return (state) => {
    switch (fieldType) {
      case FIELD_TYPES.FILE:
        // field.map-symbols
        return (
          selectorFileField(state, getValue('filename'), getValue('header-idx'))?.[
            'map-symbols'
          ].arrows ?? {}
        );

      case FIELD_TYPES.ETL:
        // etlField.map-symbols
        return selectorEtlField(state, getValue('name'))?.['map-symbols'].arrows ?? {};

      case FIELD_TYPES.WIDE:
        return (
          selectorWideField(state, getValue('filename'), getValue('name'))?.[
            'map-symbols'
          ].arrows ?? {}
        );

      default:
        throw new InputError(`mapSymbols creator unsupported fieldType: ${fieldType}`);
    }
  };
};

export default mapSymbolsSelector;
