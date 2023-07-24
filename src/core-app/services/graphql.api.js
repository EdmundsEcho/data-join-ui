// src/services/graphql.api.js

import { ApiCallError } from '../lib/LuciErrors';

/* eslint-disable no-console */

//
// use 'graphql-tag' to build graphql using AST
//
//------------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_GQL === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * Extracts the raw gql response. Returns an object
 * with error or data key.
 *
 * @function
 * @param {Object}
 * @return {Object}
 */
export function extractGql(response) {
    const error = response.data?.error ?? null;
    const obsResponseData = response.data?.data?.reqMatrixSpec;
    const noData = obsResponseData === null;
    if (response.data.status > 200 || noData || error !== null) {
        return {
            error: noData ? `The gql matrix request returned null` : error,
        };
    }
    return { data: obsResponseData };
}

/**
 *
 * Call to initialize the obs/mms gql server (sets state)
 *
 * @function
 * @param {EtlObj} obsValue The api return value: ObsEtl -> EtlObs
 * @return {Object} data.newObsEtl with subject, measurements keys
 */
export const initObsEtl = ({ subject, measurements }) => {
    if (typeof subject === 'undefined') {
        throw new ApiCallError(`Tried to instantiate obs/mms with undefined`);
    }
    return {
        query: `mutation createObsETL($obsValue: ObsEtlInput!) {
  newObsEtl(value: $obsValue) {
    subject {
      subjectType
      qualities {
        qualityName
        count
        qualityValues {
          __typename
        }
      }
    }
    measurements {
      measurementType
      components {
        componentName
        count
        componentValues {
          __typename
          ... on SpanValues {
            spanValues {
              rangeStart
              rangeLength
              reduced
            }
          }
        }
      }
    }
  }
}`,
        variables: {
            obsValue: { subject, measurements },
        },
    };
};

/**
 *
 * View the obsEtl using gql
 *
 * @function
 * @return {Object} data.newObsEtl with subject, measurements keys
 */
export const viewObsEtl = () => {
    return {
        query: `query view {
  getObsEtl {
    id
    subject {
      subjectType
      qualities {
        qualityName
        count
        qualityValues {
          __typename
        }
      }
    }
    measurements {
      measurementType
      components {
        componentName
        count
        componentValues {
          __typename
          ... on SpanValues {
            spanValues {
              rangeStart
              rangeLength
              reduced
            }
          }
        }
      }
    }
  }
}`,
    };
};

/**
 *
 * Call to generate the request required to pull the matrix data
 * from the api.
 *
 * @function
 * @param {Object} request
 * @return {Object} data.data.request query
 */
export const requestMatrix = (request) => {
    return {
        query: `query matrix($request: RequestInput!) {
  reqMatrixSpec(requestSpec: $request) {
    fieldCount
    subExpression {
      source {
        codomain
      }
      fields {
        value
      }
      filter {
        fieldName {
          value
        }
        relations {
          lhs {
            fieldName {
              value
            }
          }
          relation
          rhs {
            __typename
            ... on TxtValues {
              txtValues
            }
            ... on IntValues {
              intValues
            }
          }
        }
      }
    }
    meaExpressions {
      source {
        codomain
      }
      fields {
        value
      }
      filter {
        fieldName {
          value
        }
        relations {
          lhs {
            fieldName {
              value
            }
          }
          relation
          rhs {
            __typename
            ... on TxtValues {
              txtValues
            }
            ... on IntValues {
              intValues
            }
            ... on SpanFilter {
              range {
                filterStart
                filterEnd
              }
            }
          }
        }
      }
      fields {
        value
      }
      reducer
    }
    header {
      value
    }
  }
}`,
        variables: {
            request,
        },
    };
};

export const requestFieldNames = (request) => {
    const normalizer = ({ meaExpressions }) => {
        return {
            data: Object.values(meaExpressions).map(
                ({ filter: { fieldName } }) => fieldName.value,
            ),
        };
    };
    return {
        normalizer,
        gql: {
            query: `query matrixFieldNames($request: RequestInput!) {
  reqMatrixSpec(requestSpec: $request) {
    meaExpressions {
      filter {
        fieldName {
          value
        }
      }
    }
  }
}`,
            variables: {
                request,
            },
        },
    };
};

/**
 * filterType: FilterQualityValues | FilterComponentValues
 * filterFieldName: filterQuality | filterComponent
 * first: Int
 * last: Int
 * before: String (base64 from cursor)
 * after: String (base64 from cursor)
 *
 * filter:
 *   qualityName | componentName, measurementType
 *   filterText
 *
 * @function
 * @param {Object} input
 * @param {Object} input.filter
 * @param {?string} input.filter.filterTxt
 * @param {?string} input.filter.qualityName
 * @param {?string} input.filter.measurementType
 * @param {?string} input.filter.componentName
 * @return {Object}
 *
 */
export const requestLevels = ({ filter, ...pagingArgsRaw }) => {
    //
    if (DEBUG) {
        console.log(`graphy.api filter and pagingArgs`);
        console.dir(filter);
        console.dir(pagingArgsRaw);
    }
    //
    const { inputType, fieldName } =
        typeof filter.qualityName !== 'undefined'
            ? { inputType: 'FromQuality', fieldName: 'fromQuality' }
            : {
                fieldName: 'fromComponent',
                inputType: 'FromComponent',
            };

    const pagingArgs = Object.entries(pagingArgsRaw).reduce(
        (request, [key, value]) => {
            return `${request}${key}: ${value},`;
        },
        '',
    );

    return {
        query: `query levels($input: ${inputType}) {
         levels(${fieldName}: $input, ${pagingArgs}) {
           totalCount
           pageInfo {
             hasNextPage
             hasPreviousPage
             startCursor
             endCursor
           }
           edges {
             cursor
             node {
               ... on TxtValue {
                 level
               }
             }
           }
         }
       }`,
        variables: {
            input: filter,
        },
    };
};
