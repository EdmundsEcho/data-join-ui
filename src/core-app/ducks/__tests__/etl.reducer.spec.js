// import reducer, * as fn from '../etl.reducer';
import reducer from '../etl.reducer';
import * as actions from '../actions/etl.actions';
// import { headerViews } from '../../datasets/file-fields-data';

describe('etl.reducer', () => {
  describe('adding a new derived etl field', () => {
    const state = {
      etlObject: {
        etlUnits: {
          mval: {
            mcomps: ['existing'],
          },
        },
        etlFields: {
          sub: { name: 'sub', purpose: 'subject' },
          mval: {
            name: 'mval',
            purpose: 'mvalue',
            sources: [
              {
                filename: '/my/path/filename',
              },
            ],
          },
        },
      },
    };

    it('should create a new quality', () => {
      const field = {
        name: 'newField',
        purpose: 'quality',
        'map-files': {
          arrows: {
            '/my/path/filename': 'filename',
          },
        },
      };

      const action = actions.addDerivedField(field);
      const result = reducer(state, action);

      // Should create a new etl-unit entry
      expect(result.etlObject.etlUnits[field.name].codomain).toEqual(
        field.name,
      );
      expect(result.etlObject.etlUnits[field.name].type).toEqual('quality');

      // Should create an entry in etlFields
      expect(result.etlObject.etlFields[field.name].purpose).toEqual('quality');

      // Should add a change entry in etlFieldChanges
      expect(result.etlFieldChanges.newField.purpose).toEqual('quality');
    });
    it('should create a new component', () => {
      const field = {
        name: 'newField',
        purpose: 'mcomp',
        'map-files': {
          arrows: {
            '/my/path/filename': 'filename',
          },
        },
      };

      const action = actions.addDerivedField(field);
      const result = reducer(state, action);

      // Should not create a new top-level etl-unit entry
      expect(result.etlObject.etlUnits[field.name]).toBeUndefined();
      // And should be appended to the corresponding mvalue's mcomp array
      expect(result.etlObject.etlUnits.mval.mcomps).toEqual([
        'existing',
        field.name,
      ]);

      // Should create an entry in etlFields
      expect(result.etlObject.etlFields[field.name].purpose).toEqual('mcomp');

      // Should add a change entry in etlFieldChanges
      expect(result.etlFieldChanges.newField.purpose).toEqual('mcomp');
    });
  });
  describe('removing derived fields', () => {
    it('should remove a component field with one mapped file', () => {
      const state = {
        etlObject: {
          etlUnits: {
            existing: {},
            mval: {
              mcomps: ['exists', 'derivedComp'],
            },
          },
          etlFields: {
            mval: {
              purpose: 'mvalue',
              name: 'mval',
              sources: [{ filename: '/my/filename' }],
            },
            derivedComp: {
              purpose: 'mcomp',
            },
          },
        },
      };

      // Before it was there
      expect(state.etlObject.etlUnits.mval.mcomps).toContain('derivedComp');
      expect(state.etlObject.etlFields.derivedComp).not.toBeUndefined();

      const action = actions.removeDerivedField('derivedComp');
      const result = reducer(state, action);

      // But now it's not
      expect(result.etlObject.etlUnits.mval.mcomps).not.toContain(
        'derivedComp',
      );
      expect(result.etlObject.etlFields.derivedComp).toBeUndefined();
    });
    it('should remove a quality field', () => {
      const state = {
        etlObject: {
          etlUnits: {
            existing: {},
            derivedQual: {},
          },
          etlFields: {
            existing: {},
            derivedQual: {},
          },
        },
      };

      // Before it was there
      expect(state.etlObject.etlUnits.derivedQual).not.toBeUndefined();
      expect(state.etlObject.etlFields.derivedQual).not.toBeUndefined();

      const action = actions.removeDerivedField('derivedQual');
      const result = reducer(state, action);

      // But now it's not
      expect(result.etlObject.etlUnits.derivedQual).toBeUndefined();
      expect(result.etlObject.etlFields.derivedQual).toBeUndefined();
    });
  });
  describe('functions', () => {
    /*
    describe('_filterNonDerivedFields', () => {
      const fields = [
        {
          name: 'Q1',
          purpose: 'quality',
          'map-files': { arrows: { field: 'name' } },
        },
        {
          name: 'C1',
          purpose: 'mcomp',
        },
        {
          name: 'D-Q2',
          'map-files': { arrows: { field: 'name' } },
        },
        {
          name: 'C1',
          purpose: 'mcomp',
          'map-files': { arrows: { field: 'name' } },
        },
      ];
      it('should return true when map-files.arrows detected', () => {
        expect(fn._filterNonDerivedFields(fields[0])).toEqual(true);
        expect(fn._filterNonDerivedFields(fields[1])).toEqual(false);
        expect(fn._filterNonDerivedFields(fields[2])).toEqual(true);
        expect(fn._filterNonDerivedFields(fields[3])).toEqual(true);
      });
    });
    describe('_getDerivedFields', () => {
      const fields = [
        {
          name: 'D-Q1',
          purpose: 'quality',
          'map-files': { arrows: { field: 'name' } },
        },
        {
          name: 'C1',
          purpose: 'mcomp',
        },
        {
          name: 'D-Q2',
          purpose: 'quality',
          'map-files': { arrows: { field: 'name' } },
        },
        {
          name: 'C1',
          purpose: 'mcomp',
          'map-files': { arrows: { field: 'name' } },
        },
        {
          name: 'Q2',
          purpose: 'quality',
        },
      ];
      it('should return only qualities when requested', () => {
        const result = fn._getDerivedFields(fields, 'quality');
        expect(result.length).toEqual(2);
        expect(result[0].name).toEqual('D-Q1');
        expect(result[1].name).toEqual('D-Q2');
      });
      it('should only return comps when requested', () => {
        const result = fn._getDerivedFields(fields, 'mcomp');
        expect(result.length).toEqual(1);
        expect(result[0].name).toEqual('C1');
      });
    });
    */
  });
});
