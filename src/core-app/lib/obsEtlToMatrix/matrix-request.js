// src/lib/obsEtlToMatrix/matrix-request.js

import { Tree } from './tree';
import { NODE_TYPES } from '../sum-types';

import {
  derivedFields as dfConfig,
  fmapPreProcessCache,
} from './derived-field-requests';

import { mkQualOrCompRequest } from '../dataGridSelectionLib';

import { range } from '../../utils/common';

import { InvalidStateError, InputError } from '../LuciErrors';

//------------------------------------------------------------------------------
// const DEBUG = process.env.REACT_APP_DEBUG_MATRIX === 'true';
const DEBUG = true;
//------------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * 📌
 *
 * The public API
 *
 *    flatTree -> matrix request ready for obs/mms gql service
 *
 * ⬜ Extract group-semantics
 *
 * 🚧 May want create a chain of function calls with a shared closure/context.
 *
 *    👉 Tree.fromFlatNodes
 *
 *    👉 Tree.findNodes
 *
 *    👉 buildRequest
 *
 * ⚠️  Depends on the location of node data being at tree height 4
 *    ... this should not be exposed.
 *
 * @function
 * @param {Object} flatTree
 * @return {Objec}
 * @throws {InvalidStateError}
 */
export function requestFromTree(flatTree) {
  /* eslint-disable no-shadow */
  // instantiate the tree
  const tree = Tree.fromFlatNodes(flatTree);

  // derived fields
  const derivedFieldNodes = Tree.findNodes(tree, (node) => {
    return (
      node.type === NODE_TYPES.CANVAS &&
      node.height === 3 &&
      node.data?.displayType === 'derivedField'
    );
  });
  if (DEBUG) {
    console.debug(`👉 nodes: ${derivedFieldNodes.length}`);
    console.dir(derivedFieldNodes);
  }
  // recipe for processing a derived field
  // 1️⃣   get the identifier in order to retrieve the configuration
  // 2️⃣   determine how to read and dedup the cache from the configuration
  //     (cache: [[fieldName]])
  // 3️⃣   map the inputs to the cache field names
  // 4️⃣   return an Array of derived field configurations
  const getDerivedFieldIdentifier = (node) => node.data.identifier;

  // fmap combines all of the inputs prior to processing
  const isFmap = (identifier) => dfConfig[identifier].fmapOrApply === 'fmap';
  // specified arity
  const getDerivedFieldArity = (identifier) => dfConfig[identifier].arity;
  // position, cache -> parameter set at a given position
  const getParameterSet = (position, node) => node.data.cache?.[position] ?? [];

  // position, cache -> parameter set at a given position
  const getApplicationParameters = (node) => node.data.cache;

  const requiresExpansion = (node) => {
    return (
      (getParameterSet(0, node)?.length === 1 ?? false) &&
      (getParameterSet(1, node)?.length > 1 ?? false)
    );
  };

  const repeatFirstParam = (node) => {
    const [param1] = getParameterSet(0, node);
    return getParameterSet(1, node).flatMap(() => [param1]);
  };

  // Make the configurations
  // fmap && applicative (like)
  // :: Array [Configuration]
  const configurations = derivedFieldNodes.flatMap((node) => {
    //
    const identifier = getDerivedFieldIdentifier(node);
    //
    if (isFmap(identifier)) {
      return fmapPreProcessCache(node).map(dfConfig[identifier].config);
    }
    // now determine what kind of Applicative
    // arity 2: 1 : N
    // arity N?
    //
    const designArity = (node) => node.childCount;
    if (designArity(node) !== node.data.cache.length) {
      // validate the correct "operation" of the workbench
      throw new InvalidStateError(
        `The group-level cache is flawed: children: ${designArity(node)} ==? cache: ${
          node.data.cache.length
        }`,
      );
    }
    if (designArity(node) !== getDerivedFieldArity(identifier)) {
      throw new InputError(`Missing input for this derived field`);
    }

    //
    // raw input -> expanded to a fully expressed request
    //
    // scenario 1, only when arity == 2:
    //   input 1: [a]
    //   input 2: [a,b,c]
    //   -> [a,a,a], [a,b,c]
    //
    // scenario 2:
    //   input 1: [a,b,c]
    //   input 2: [a,b,c]
    //   ...
    //   -> [a,b,c], [a,b,c], ...
    //

    let applicationParameters = getApplicationParameters(node);
    if (requiresExpansion(node)) {
      applicationParameters = repeatFirstParam(node);
    }

    //
    // build out the configuration
    // number of configs = length of parameter set (inner array)
    // length of the config = number of parameters (outer array)
    //
    // arity 2: [a,b,c], [a,b,c] -> [config, config, config]
    // arity 3: [a,b,c], [a,b,c], [a,b,c] -> [config, config, config]
    //

    const configs = applicationParameters[0]
      .map((numerator, internalIdx) => {
        const config = range(1, dfConfig[identifier].arity).reduce(
          (input, idx) => {
            input.push(applicationParameters[idx][internalIdx]);
            return input;
          },
          [numerator],
        );

        if (DEBUG) {
          console.debug(`config`);
          console.dir(config);
        }
        return config;
      })
      .map((cfg) => dfConfig[identifier].config(cfg));
    // dfConfig[identifier].config);

    return configs;
  });
  if (DEBUG) {
    console.debug(`👉 Configurations`);
    console.dir(configurations);
  }

  /* eslint-enable no-shadow */

  // instantiate the tree
  return {
    fields: buildRequest(
      Tree.findNodes(tree, (node) => {
        return node.type === NODE_TYPES.CANVAS && node.height === 4;
      }).map((node) => node.data),
    ),
    derivedFields: configurations,
    /*
     * Derived field:
     * group x cache
     *
     * ... apply derived field to each of the entries in the cache
     * 🔖 what are the different ways to feed the function
     *
    derivedFields: dedupMeaExpressions(
      derivedFields.flatMap(makeNodeDerivedFields),
      (exp) => exp.fieldName,
    ),
     */
    // generateDerivedFieldRequest(data, childDatas),
  };
}
/**
 * Returns a set of expressions (no duplicates)
 * @function
 * @param {Array<Object>} expressions
 * @param {Function} getKey
 * @return {Array<Object>}
 */
export function dedupMeaExpressions(expressions, getKey = (x) => x) {
  /* eslint-disable no-shadow, no-param-reassign */
  let key = '';
  return [
    ...expressions
      .reduce((ref, expression) => {
        key = getKey(expression);
        if (!ref.has(key)) {
          ref.set(key, expression);
        }
        return ref;
      }, new Map())
      .values(),
  ];
}

/**
 * how make the derived field request
 *
 * @function
 * @param {Object} node
 * @return {Array<DerivedFieldConfig>}
function makeNodeDerivedFields(node) {
  // fmap ~ [input name] -> [derived field config]
  // apply ~ input names -> derived field config
  if (typeof node?.data?.identifier === 'undefined') {
    return [];
  }
  const fnId = node.data.identifier;

  const go =
    dfConfig[fnId].fmapOrApply === 'fmap'
      ? (inputs) => inputs.map((input) => dfConfig[fnId].config(input))
      : (inputs) => [dfConfig[fnId].config(inputs)];

  return go(node.data.cache.data);
}
 */

export function requestFromNode(flatTree, { id, displayType }) {
  // sub
  const getData = ['derivedField'].includes(displayType)
    ? (node) => node.children.map(({ data }) => data)
    : ({ data }) => [data];

  const unwrap = ([fields]) => fields;

  // instantiate the tree
  const tree = Tree.fromFlatNodes(flatTree);

  return {
    fields: buildRequest(
      unwrap(
        Tree.findNodes(tree, (node) => {
          return node.id === id;
        }).map(getData),
      ),
    ),
  };
}

/**
 * between obs/mms and tnc that pull the matrix data, we have two tasks:
 * 👉 Append the request with derived fields
 * 👉 🦀 adjust the time ranges using the time prop from each of the
 *       etlUnit::measurement in the request
 *       ⚠️  this may involve renaming fields
 *
 * @function
 * @param {Object} obsResponse
 * @param {Array<Object>} derived
 * @return {Object}
 */
export function withDerivedFields(obsResponse, derived = []) {
  return {
    matrix: obsResponse,
    derived,
  };
}

const mkQuality = (quality) => {
  const { selectionModel, qualityName, tag } = quality;
  const { antiRequest, request } = mkQualOrCompRequest(selectionModel);
  const result = {
    antiRequest,
    qualityName,
    qualityValues: {
      // txtValues: [ "FAMILY", "INTERNAL" ]
      [tag]: request,
    },
  };
  if (DEBUG) {
    console.log(`%cquality making`, 'color:orange');
    console.dir(quality);
    console.dir(result);
  }
  return result;
};

const mkComponent = (comp) => {
  const { selectionModel, componentName, tag } = comp;
  const { antiRequest, request, reduced } = mkQualOrCompRequest(
    selectionModel,
    comp?.values,
  );
  const result = {
    antiRequest,
    componentName,
    componentValues: {
      reduced,
      [tag]: request,
    },
  };
  if (DEBUG) {
    console.log(`%ccomp making`, 'color:green');
    console.dir({ comp, result, antiRequest, request, reduced });
    if (antiRequest) {
      console.warn('Need to convert the antiRequest to a request', comp);
    }
  }
  return result;
};

const mkCompMix = (comp) => {
  if (DEBUG) {
    console.log(`mkCompMix comp`);
    console.dir(comp);
  }
  const componentMix = Object.values(comp.values)
    .filter((v) => v.request)
    .map((comp_, idx) => mkComponent(comp_, idx));

  return {
    measurementType: comp.measurementType,
    componentMix,
  };
};

//------------------------------------------------------------------------------
/**
 *
 * etlUnit::quality
 *
 * 🔖 The values prop hosts the selectionModel. It can be
 *    either 'REQUEST' | 'ANTIREQUEST'
 *
 * antiRequest = true when any value has request = false
 *
 * @function
 * @param {Qualities} qualities
 * @return {Array<Quality>}
 */
const buildQualityMixes = (etlUnits) => {
  const qualityMix = etlUnits
    .filter((etlUnit) => etlUnit.value.request)
    .map((etlUnit, idx) => mkQuality(etlUnit.value, idx));

  return {
    subjectType: etlUnits.length === 0 ? null : etlUnits[0].subjectType || 'SUBJECT',
    qualityMix,
  };
};

//------------------------------------------------------------------------------
/**
 *
 * etlUnit::measurement
 *
 * @function
 * @param {Components} qualities
 * @return {Array<Component>}
 */
const buildComponentMixes = (requestEtlUnits) => {
  return requestEtlUnits
    .filter((unit) => unit.value.request)
    .map((unit) => unit.value)
    .map(mkCompMix);
};

//------------------------------------------------------------------------------
/**
 * Builds the finised matrix request
 * props: subReq, meaReqs
 *
 * @function
 * @param {Array<{EtlUnit}>}
 * @return {Object}
 */
function buildRequest(selectedUnits) {
  const qualityUnits = selectedUnits.filter(
    (etlUnit) => etlUnit.type === 'etlUnit::quality',
  );
  const measurementUnits = selectedUnits.filter(
    (etlUnit) => etlUnit.type === 'etlUnit::measurement',
  );

  const subReq = buildQualityMixes(qualityUnits);
  const meaReqs = buildComponentMixes(measurementUnits);

  return { subReq, meaReqs };
}

export default { mkQuality, mkComponent };
//------------------------------------------------------------------------------
/*
 * 🦀 The request generator is not behaving as expected
 *
 * sort meaReqs by measurementType
 * 🛈  measurementType are equal? => combine componentMix
 *
 * sort componentMix by componentName
 * 🛈  componentName are equal? => combine componentValues
 *    * reduced = false??
 *
 * 🔑 A measurement can have more than one componentMix
 *
 */
/*
  "meaReqs": [
     {
         "measurementType": "m_rxactivity",
         "componentMix": [
             {
                 "componentName": "time",
                 "componentValues": {
                     "reduced": false,
                     "spanValues": [
                         {
                             "rangeStart": 33,
                             "rangeLength": 4,
                             "reduced": false
                         }
                     ]
                 }
             }
         ]
     },
     {
         "measurementType": "m_rxactivity",
         "componentMix": [
             {
                 "componentName": "time",
                 "componentValues": {
                     "reduced": false,
                     "spanValues": [
                         {
                             "rangeStart": 33,
                             "rangeLength": 21,
                             "reduced": true
                         }
                     ]
                 }
             }
         ]
     }
  ]

  */
