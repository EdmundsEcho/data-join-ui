/**
 * Data for the create-etl-field module.
 *
 */
export const etlObject = {
  etlUnits: {
    mval: {
      type: 'mvalue',
      subject: 'sub',
      mcomps: ['ExistingComp'],
      mspan: 'span',
    },
  },
  etlFields: {
    sub: {
      name: 'sub',
      purpose: 'subject',
      enabled: true,
      levels: [],
    },
    mval: {
      name: 'mval',
      purpose: 'mvalue',
      enabled: true,
      levels: [],
      sources: [
        {
          filename: '/my/path/filename',
        },
      ],
    },
    span: {
      name: 'span',
      purpose: 'mspan',
      enabled: true,
      levels: [],
      sources: [
        {
          filename: '/my/path/filename',
        },
      ],
    },
  },
};

export const newQualField = {
  idx: 22,
  name: 'newQuality',
  enabled: true,
  purpose: 'quality',
  levels: [['x', 104]],
  'map-symbols': {},
  'etl-unit': {},
  time: {},
  format: null,
  'null-value-expansion': null,
  'map-files': {
    arrows: {
      '/my/path/filename.csv': 'x',
    },
  },
  'map-weights': {
    arrows: {
      x: 1,
    },
  },
  'codomain-reducer': null,
  'slicing-reducer': 'SUM',
  sources: [],
};

export const newCompField = {
  idx: 22,
  name: 'Component Field',
  enabled: true,
  purpose: 'mcomp',
  levels: [['x', 104]],
  'map-symbols': {},
  'etl-unit': {},
  time: {},
  format: null,
  'null-value-expansion': null,
  'map-files': {
    arrows: {
      '/my/path/filename': 'x',
    },
  },
  'map-weights': {
    arrows: {
      x: 1,
    },
  },
  'codomain-reducer': null,
  'slicing-reducer': 'SUM',
  sources: [],
};

export default etlObject;
