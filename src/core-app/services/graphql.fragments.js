// """
// Fragment to view the obsEtl data in toto.
// """
export const obsEtlViewFragment = `
fragment obsEtlView on ObsETL {
    subject {
      subjectType
      qualities {
        qualityName
        qualityValues {
          __typename
          ... on TxtValues {
            txtValues
          }
          ... on IntValues {
            intValues
          }
        }
    }
    measurements {
      measurementType
      components {
        componentName
        componentValues {
          __typename
          ... on TxtValues {
            txtValues
          }
          ... on IntValues {
            intValues
          }
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
}`;
// """
// Fragment to view the obsEtl data with select values.
// """
// export const obsEtlLeanViewFragment = `fragment obsEtlLeanView on ObsETL {
export const obsEtlLeanViewFragment = `
    subject {
      subjectType
      qualities {
        qualityName
        qualityValues {
          __typename
      }
    }
    measurements {
      measurementType
      components {
        componentName
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
    }`;
