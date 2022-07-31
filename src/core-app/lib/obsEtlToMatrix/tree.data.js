// a serialized version of a Tree
// used by tree.test.js
export const data = {
  obsEtl: {
    subject: {
      subjectType: 'NPI',
      qualities: [
        {
          qualityName: 'q_specialty',
          qualityValues: {
            txtValues: ['CARDIOVASCULAR DISEASES', 'CCM', 'CD', 'VS'],
          },
        },
        {
          qualityName: 'q_state',
          qualityValues: {
            txtValues: ['AK', 'AL', 'WV', 'WY', 'ZZ'],
          },
        },
      ],
    },
    measurements: [
      {
        measurementType: 'm_nrx',
        components: [
          {
            componentName: 'rxpayer',
            componentValues: {
              __typename: 'TxtValues',
              txtValues: ['CASH', 'MEDICAID', 'TOTAL THIRD PARTY'],
            },
          },
          {
            componentName: 'time',
            componentValues: {
              __typename: 'SpanValues',
              spanValues: [
                {
                  rangeStart: 0,
                  rangeLength: 20,
                  reduced: false,
                },
              ],
            },
          },
        ],
      },
      {
        measurementType: 'm_reach',
        components: [
          {
            componentName: 'time',
            componentValues: {
              __typename: 'SpanValues',
              spanValues: [
                {
                  rangeStart: 11,
                  rangeLength: 18,
                  reduced: false,
                },
              ],
            },
          },
        ],
      },
    ],
  },
};
