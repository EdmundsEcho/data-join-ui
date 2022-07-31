import buildErrors from './validate-widetolong-fields';

describe('Validating wide-to-long fields', () => {
  it('should complain if mvalue is not set', () => {
    const config = {
      config: {
        mvalue: null,
        factors: [],
      },
    };

    const fieldData = {};

    const result = buildErrors(config, fieldData);

    expect(result).toContain('Measurement Name cannot be blank');
  });
  it('should complain if factors do not have a name set', () => {
    const config = {
      config: {
        mvalue: null,
        factors: [
          {
            name: '',
            purpose: 'mcomp',
          },
        ],
      },
    };

    const fieldData = {};

    const result = buildErrors(config, fieldData);

    expect(result).toContain('Factors must have a name');
  });
  it('should complain if factors do not have a purpose set', () => {
    const config = {
      config: {
        mvalue: null,
        factors: [
          {
            name: 'name',
            purpose: null,
          },
        ],
      },
    };

    const fieldData = {};

    const result = buildErrors(config, fieldData);

    expect(result).toContain('Factors must have a purpose');
  });
  it('should complain when fieldData.length <> factor length', () => {
    const config = {
      config: {
        mvalue: null,
        factors: [
          {
            name: 'name',
            purpose: null,
          },
        ],
        'header-idxs': ['Send2014_04', 'Send2014_05', 'Send2014_06'],
      },
    };

    const fieldData = {
      name: {
        aliases: ['Send2014_04', 'Send2014_05'],
        values: ['Send', 'Send'],
      },
    };

    const result = buildErrors(config, fieldData);

    expect(result).toContain('All fields must be filled');
  });
});
