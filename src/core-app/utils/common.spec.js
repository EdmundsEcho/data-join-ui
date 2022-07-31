import * as common from './common';

/* eslint-disable no-console */

const consoleLog = console.log;
const consoleError = console.error;

describe.only('utils/common', () => {
  beforeEach(() => {
    console.log = consoleLog;
    console.error = consoleError;
  });

  describe('prettyPrice', () => {
    it('following zero', () => {
      const price = '3.4';
      const expected = '3.40';
      expect(common.prettyPrice(price)).toEqual(expected);
    });

    it('proceeding zero', () => {
      const price = '003.4';
      const expected = '3.40';
      expect(common.prettyPrice(price)).toEqual(expected);
    });

    it('no decimal', () => {
      const price = '3';
      const expected = '3.00';
      expect(common.prettyPrice(price)).toEqual(expected);
    });

    it('no decimal, proceeding zero', () => {
      const price = '003';
      const expected = '3.00';
      expect(common.prettyPrice(price)).toEqual(expected);
    });

    it('non-numeric', () => {
      const price = 'abc';
      const expected = '?';
      expect(common.prettyPrice(price)).toEqual(expected);
    });
  });
  describe('prettyNumber', () => {
    const f = common.prettyNumber;
    it('should return a comma separated integer', () => {
      const number = 1000000;
      const expected = '1,000,000';
      expect(f(number)).toEqual(expected);
    });
    it('should return a comma separated float', () => {
      const number = 1000000.38;
      const expected = '1,000,000.38';
      expect(f(number)).toEqual(expected);
    });
  });
  describe('dualNum', () => {
    it('single number', () => {
      const number = 3;
      const expected = '03';
      expect(common.dualNum(number)).toEqual(expected);
    });

    it('double digit', () => {
      const number = 33;
      const expected = '33';
      expect(common.dualNum(number)).toEqual(expected);
    });
  });

  describe('pathSep ()', () => {
    it('should return \\ when OS is Windows', () => {
      const windowsPath = '\\Windows\\OS\\path';
      expect(common.pathSep(windowsPath)).toEqual('\\');
    });

    it('should return / when OS is a Unix variant', () => {
      const unixPath = '/maybe/mac/or/linux';
      expect(common.pathSep(unixPath)).toEqual('/');
    });
  });
  describe('formatFileSize ()', () => {
    const f = common.formatFileSize;
    it('should convert to bytes', () => {
      const bytes = 100;
      const expected = '100 Bytes';
      expect(f(bytes)).toEqual(expected);
    });

    it('should convert to KB', () => {
      const bytes = 1999;
      const expected = '1.95 KB';
      expect(f(bytes)).toEqual(expected);
    });

    it('should convert to MB', () => {
      const bytes = 736854016;
      const expected = '736.85 MB';
      expect(f(bytes)).toEqual(expected);
    });

    it('should convert to GB', () => {
      const bytes = 2281383403;
      const expected = '2.28 GB';
      expect(f(bytes)).toEqual(expected);
    });

    it('should return an empty string if null given', () => {
      const expected = '';
      expect(f(null)).toEqual(expected);
      expect(f(undefined)).toEqual(expected);
    });
  });
  describe('getFilenameFromPath', () => {
    const f = common.getFilenameFromPath;
    it('should return the last part of path', () => {
      const path = '/this/is/a/long/path';
      const expected = 'path';

      expect(f(path)).toEqual(expected);
    });
    it('should return filename when top-level path given', () => {
      const path = '/path';
      const expected = 'path';

      expect(f(path)).toEqual(expected);
    });
    it('should return filename when no slash given', () => {
      const path = 'path';
      const expected = 'path';

      expect(f(path)).toEqual(expected);
    });
    it('should return path even on Windows', () => {
      const path = '\\path\\to\\my\\WindowsMachine';
      const expected = 'WindowsMachine';

      expect(f(path)).toEqual(expected);
    });
  });
  describe('getParentPath', () => {
    const f = common.getParentPath;
    it('should return the last part of path', () => {
      const path = '/this/is/a/long/path';
      const expected = '/this/is/a/long';

      expect(f(path)).toEqual(expected);
    });
    it('should return a string path one directory above', () => {
      const path = '\\path\\to\\my\\WindowsMachine';
      const expected = '\\path\\to\\my';

      expect(f(path)).toEqual(expected);
    });
    it('should handle the root path', () => {
      const path = '/Users';
      const expected = '/';

      expect(f(path)).toEqual(expected);
    });
    it('should handle the root path in a Windows environment', () => {
      const path = '\\Users';
      const expected = '\\';

      expect(f(path)).toEqual(expected);
    });
    it('should handle a root path', () => {
      expect(f('/')).toEqual('/');
      expect(f('\\')).toEqual('\\');
    });
  });
  describe('listWithEllipsis', () => {
    const f = common.listWithEllipsis;
    it('should return a list of items when max equals list.length', () => {
      const list = ['adam', 'is', 'cool'];
      const max = 3;
      const expected = 'adam, is, cool';

      expect(typeof f(max, list)).toEqual('string');
      expect(f(max, list)).toEqual(expected);
    });
    it('should return a list of items with an ellipsis when max is less than list.length', () => {
      const list = ['adam', 'is', 'cool', 'and', 'a', 'great', 'guy'];
      const max = 3;
      const expected = 'adam, is, cool, ...';

      expect(typeof f(max, list)).toEqual('string');
      expect(f(max, list)).toEqual(expected);
    });
    it('should handle strings too!', () => {
      const list = 'adam is cool and';
      const max = 12;
      const expected = 'adam is cool...';

      expect(typeof f(max, list)).toEqual('string');
      expect(f(max, list)).toEqual(expected);
    });
  });

  describe('indexFields', () => {
    const etlFields = {
      subjectField: {
        purpose: 'subject',
      },
      qualityField: {
        purpose: 'quality',
      },
      mcomp1Field: {
        purpose: 'mcomp',
      },
      mcomp2Field: {
        purpose: 'mcomp',
      },
      mspanField: {
        purpose: 'mspan',
      },
      mvalueField: {
        purpose: 'mvalue',
      },
    };
    it('should zero index fields', () => {
      const result = common.indexObject(etlFields);
      expect(result.subjectField.idx).toEqual(0);
      expect(result.qualityField.idx).toEqual(1);
      expect(result.mcomp1Field.idx).toEqual(2);
      expect(result.mcomp2Field.idx).toEqual(3);
      expect(result.mspanField.idx).toEqual(4);
      expect(result.mvalueField.idx).toEqual(5);
    });
  });
  describe('dedupArray()', () => {
    it('return empty when input is empty', () => {
      expect(common.dedupArray([])).toEqual([]);
    });
    it('return the same value when no duplicates exist', () => {
      expect(common.dedupArray(['this', 'that'])).toEqual(['this', 'that']);
    });
    it('return a different array when duplicates exist', () => {
      expect(common.dedupArray(['this', 'that', 'that'])).toEqual([
        'this',
        'that',
      ]);
    });
    it('Pre-process the values prior to de-duping when a fn is provided', () => {
      expect(
        common.dedupArray(['This', 'that', 'That'], (v) => v.toLowerCase()),
      ).toEqual(['this', 'that']);
    });
  });
  describe('dedupArrayWithIndex ()', () => {
    it('should handle duplicate header columns', () => {
      expect(
        common.dedupArrayWithIndex(['header', 'header', 'unique']),
      ).toEqual(['header', 'header01', 'unique']);

      expect(
        common.dedupArrayWithIndex([
          'first',
          'header',
          'header',
          'header',
          'unique',
        ]),
      ).toEqual(['first', 'header', 'header01', 'header02', 'unique']);

      expect(
        common.dedupArrayWithIndex([
          'header',
          'header',
          'header',
          'unique',
          'header',
        ]),
      ).toEqual(['header', 'header01', 'header02', 'unique', 'header03']);
    });
    it('should be case-insensitive', () => {
      expect(
        common.dedupArrayWithIndex(['Header', 'header', 'unique']),
      ).toEqual(['Header', 'header01', 'unique']);

      expect(
        common.dedupArrayWithIndex(['Header', 'header', 'unique', 'HeAdEr']),
      ).toEqual(['Header', 'header01', 'unique', 'HeAdEr02']);
    });
  });
  describe('sanitizeString ()', () => {
    it('should remove whitespace around header column strings', () => {
      expect(common.sanitizeString(' column')).toEqual('column');
      expect(common.sanitizeString(' column ')).toEqual('column');
      expect(common.sanitizeString()).toEqual('');
      expect(common.sanitizeString(null)).toEqual('');
    });
  });
  describe('sanitizeTableName', () => {
    it('should remove any number of whitespace', () => {
      expect(common.sanitizeTableName('my table')).toEqual('mytable');
      expect(common.sanitizeTableName('my   table')).toEqual('mytable');
      expect(common.sanitizeTableName(' my   table ')).toEqual('mytable');
    });
    it('should be lowercase', () => {
      expect(common.sanitizeTableName('MytAble')).toEqual('mytable');
      expect(common.sanitizeTableName('MYTABLE')).toEqual('mytable');
    });
    it('should remove symbols', () => {
      expect(common.sanitizeTableName('my@table')).toEqual('mytable');
      expect(common.sanitizeTableName('my_table')).toEqual('my_table');
    });
  });
  describe('lowercase StringValue -> stringValue', () => {
    it('return empty when empty', () => {
      expect(common.lowerFirstChar('')).toEqual('');
    });
    it('StringValue -> stringValue', () => {
      expect(common.lowerFirstChar('StringValue')).toEqual('stringValue');
    });
  });
});
