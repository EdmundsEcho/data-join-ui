export default {
  id: 'OID000',
  measurements: [
    {
      components: [
        {
          componentName: 'paymenttypegroup',
          componentValues: {
            textValues: ['TOTAL THIRD PARTY', 'CASH'],
          },
        },
        {
          componentName: 'time',
          componentValues: {
            spanValues: [
              {
                rangeLength: 19,
                rangeStart: 0,
                reduced: false,
              },
            ],
          },
        },
      ],
      measurementType: 'm_nrxcount',
    },
  ],
  subject: {
    qualities: [
      {
        qualityName: 'q_primaryspecialtydesc',
        qualityValues: {
          textValues: [
            'NURSE PRACTITIONER',
            'CARDIOVASCULAR DISEASES',
            'INTERNAL MED, CARD. ELECTROPHYSIOLOGY',
            'PHYSICIAN ASSISTANT',
            'FAMILY PRACTICE',
          ],
        },
      },
      {
        qualityName: 'q_practitionerstate',
        qualityValues: {
          textValues: ['NJ', 'AL', 'TN', 'UT', 'TX', 'AZ', 'GA', 'NY'],
        },
      },
      {
        qualityName: 'q_practitionerzipcode',
        qualityValues: {
          textValues: [
            '07060',
            '35243',
            '37916',
            '35007',
            '35294',
            '84010',
            '37862',
            '76104',
            '85712',
            '30328',
            '10901',
          ],
        },
      },
    ],
    subjectType: 'NPI',
  },
};
