export default {
  sources: {
    id_1: {
      filename: 'savaysa.csv',
      field_name: 'spec',
      idx: 2,
    },
    id_2: {
      filename: 'warfarin.csv',
      field_name: 'specialty',
      idx: 2,
    },
  },
  field_name: 'specialty_rollup',
  type: 'quality',
  steps: [
    {
      in: ['id_1'],
      out: 'uid_1',
      fn: 'rollup',
      params: { name: 'spec_rollup_1' },
    },
    {
      in: ['id_2'],
      out: 'uid_2',
      fn: 'rollup',
      params: { name: 'spec_rollup_2' },
    },
    {
      in: ['uid_1', 'uid_2'],
      out: 'uid_3',
      fn: 'merge',
      params: { agg: 'first' },
    },
  ],
};
