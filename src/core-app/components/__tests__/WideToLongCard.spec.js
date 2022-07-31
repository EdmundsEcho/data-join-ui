// import React from 'react';
// import { render, cleanup } from '@testing-library/react';
// import WideToLongCard, * as functions from '../WideToLongCard';

/*
describe('WideToLongCard', () => {
  describe('Component', () => {
    afterEach(cleanup);
    it('should require that there is a measurement', () => {
      const fn = jest.fn();

      const wideToLongFields = {
        config: {},
        fields: [],
      };

      const { getByText } = render(
        <WideToLongCard onFieldsChange={fn} headerView={wideToLongFields} />,
      );
    });
  });
  describe('functions', () => {
    describe('_buildFieldData()', () => {
      it('should add new field input to exisiting field data', () => {
        const config = {
          config: {
            mvalue: 'name',
            factors: [
              { name: 'fact1', purpose: 'mcomp' },
              { name: 'fact2', purpose: 'mspan' },
            ],
          },
          fields: {
            fact1: {
              'map-fieldname': {
                arrows: {
                  Click: '',
                },
              },
            },
            fact2: {},
          },
        };

        const factors = [{ name: 'fact1', purpose: null }];
        const fields = {
          Send2014_04___0: 'Send',
          Send2014_05___0: 'Send',
          Send2014_06___0: 'Send',
        };

        const result = functions._buildFieldData(factors, fields);

        expect(result).toEqual({
          fact1: {
            aliases: ['Send2014_04', 'Send2014_05', 'Send2014_06'],
            values: ['Send', 'Send', 'Send'],
          },
        });
      });
    });
    describe('_updateTimingFieldData()', () => {
      const config = {
        config: {
          mvalue: 'mvalue name',
          factors: [
            {
              name: 'date',
              purpose: 'mspan',
            },
          ],
        },
        fields: {
          date: {
            enabled: true,
            'field-alias': 'date',
            'map-fieldnames': {
              arrows: {
                Click: '2019_11',
              },
            },
          },
        },
      };
      it('should return timingField when no dateIdx supplied', () => {
        const field = {
          unaltered: 'object',
        };

        const result = functions._updateTimingFieldData(null, field, config);
        expect(result).toEqual(field);
      });
      it('should generate levels based on map-fieldnames.arrows', () => {
        const field = {
          name: 'Date',
          purpose: 'mspan',
          format: 'YYYY_MM',
          time: {
            interval: {
              unit: 'M',
              count: 1,
            },
          },
        };

        const result = functions._updateTimingFieldData(0, field, config);

        // levels should exist in the result
        expect(result.levels).toEqual([['2019_11', 1]]);
      });
      it('should return a mspan-levels key when fully configured', () => {
        const field = {
          name: 'Date',
          purpose: 'mspan',
          format: 'YYYY_MM',
          time: {
            interval: {
              unit: 'M',
              count: 1,
            },
          },
        };

        // Assertions before
        // These keys did not previously exist in the field
        expect(field.time.reference).toEqual(undefined);
        expect(field.levels).toEqual(undefined);
        expect(field['levels-mspan']).toEqual(undefined);

        const result = functions._updateTimingFieldData(0, field, config);

        // levels-mspan should also exist in the result
        expect(result['levels-mspan'].length).toEqual(1);
        expect(result['levels-mspan'][0].rangeLength).toEqual(1);
        expect(result['levels-mspan'][0].rangeStart).toEqual(0);
        expect(result['levels-mspan'][0].reduced).toEqual(false);

        // time.reference should only have one reference
        expect(Object.keys(result.time.reference).length).toEqual(1);
        // time.reference should exist
        expect(result.time.reference[0]).toEqual('2019_11');
      });

      it('should return a partially complete time.interval when no format', () => {
        const field = {
          name: 'Date',
          purpose: 'mspan',
          format: null,
          time: {
            interval: {
              unit: 'M',
              count: 1,
            },
          },
        };

        // Assertions before
        expect(field.format).toEqual(null);
        expect(field.time.reference).toEqual(undefined);
        expect(field.time.interval.unit).toEqual('M');
        expect(field.time.interval.count).toEqual(1);

        const result = functions._updateTimingFieldData(0, field, config);

        expect(result.format).toEqual(null);
        expect(result.time.interval.unit).toEqual('M');
        expect(result.time.interval.count).toEqual(1);
      });
      it('should return a partially complete time.interval when no time.interval.unit', () => {
        const field = {
          name: 'Date',
          purpose: 'mspan',
          format: null,
          time: {
            interval: {
              unit: null,
              count: 1,
            },
          },
        };

        // Assertions before
        expect(field.format).toEqual(null);
        expect(field.time.reference).toEqual(undefined);
        expect(field.time.interval.unit).toEqual(null);
        expect(field.time.interval.count).toEqual(1);

        const result = functions._updateTimingFieldData(0, field, config);

        expect(result.format).toEqual(null);
        expect(result.time.interval.unit).toEqual(null);
        expect(result.time.interval.count).toEqual(1);
      });
    });
  });
});

    */
