import validateHeaderViews from './headerviews-errors';

describe('validateHeaderViews', () => {
  describe('overall', () => {
    it('should return an empty object if there are no errors', () => {
      const filename = '/my/path';
      const headerViews = {
        [filename]: {
          enabled: true,
          filename,
          fields: [
            {
              filename,
              'header-idx': 0,
              'field-alias': 'a',
              purpose: 'subject',
              enabled: true,
            },
            {
              filename,
              'header-idx': 1,
              'field-alias': 'b',
              purpose: 'mvalue',
              enabled: true,
            },
            {
              filename,
              'header-idx': 2,
              'field-alias': 'c',
              purpose: 'mspan',
              enabled: true,
              time: { interval: { unit: 'M', count: 1 } },
            },
          ],
        },
      };

      expect(validateHeaderViews(headerViews)).toEqual({});
    });
    it('should ignore fields that are not enabled', () => {
      const filename = '/my/path';
      const headerViews = [
        {
          filename,
          enabled: true,
          fields: [
            { filename, 'field-alias': 'a', purpose: 'subject', enabled: true },
            {
              filename,
              'field-alias': 'b',
              purpose: 'subject',
              enabled: false,
            },
            { filename, 'field-alias': 'c', purpose: 'mvalue', enabled: true },
            {
              filename,
              'field-alias': 'd',
              purpose: 'mspan',
              enabled: true,
              time: { interval: { unit: 'M', count: 1 } },
            },
          ],
        },
      ];

      expect(validateHeaderViews(headerViews)).toEqual({});
    });
  });
  describe('subject-related validations', () => {
    it('should require at least one subject', () => {
      const filename = '/my/path';
      const headerViews = [
        {
          enabled: true,
          filename,
          fields: [
            { filename, 'field-alias': 'a', purpose: 'mvalue', enabled: true },
          ],
        },
      ];

      const result = validateHeaderViews(headerViews)[filename];
      expect(result).toEqual(
        expect.arrayContaining(['There must be 1 subject']),
      );
    });
    it('should require no more than 1 subject', () => {
      const filename = '/my/path';
      const headerViews = [
        {
          enabled: true,
          filename,
          fields: [
            { filename, 'field-alias': 'a', purpose: 'subject', enabled: true },
            { filename, 'field-alias': 'b', purpose: 'subject', enabled: true },
          ],
        },
      ];

      const result = validateHeaderViews(headerViews)[filename];

      expect(result).toEqual(
        expect.arrayContaining(['There can only be 1 subject']),
      );
    });
  });
  describe('field-alias validations', () => {
    it('should require unique field-aliases for enabled fields', () => {
      const filename = '/my/path';
      const headerViews = [
        {
          enabled: true,
          filename,
          fields: [
            { filename, 'field-alias': 'a', purpose: 'subject', enabled: true },
            { filename, 'field-alias': 'a', purpose: 'mvalue', enabled: true },
          ],
        },
      ];

      const result = validateHeaderViews(headerViews)[filename];

      expect(result).toEqual(
        expect.arrayContaining(['Duplicate field names are not allowed']),
      );
    });
    it('should ignore enabled=false fields', () => {
      const filename = '/my/path';
      const headerViews = [
        {
          enabled: true,
          filename,
          fields: [
            { filename, 'field-alias': 'a', purpose: 'subject', enabled: true },
            { filename, 'field-alias': 'a', purpose: 'mvalue', enabled: false },
          ],
        },
      ];

      const result = validateHeaderViews(headerViews)[filename];
      expect(result).not.toEqual(
        expect.arrayContaining(['Duplicate field names are not allowed']),
      );
    });
  });
});
