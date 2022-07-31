import * as helpers from './headerview-helpers';

describe('file-to-header-helpers functions', () => {
  describe('mapHeaderViews', () => {
    it('should map over all hvs and apply callback to each one', () => {
      const hv = {
        path1: {
          filename: 'path1',
          enabled: true,
        },
        path2: {
          filename: 'path2',
          enabled: false,
        },
      };

      const callback = (hv) => ({
        ...hv,
        new: 'item',
      });

      const result = helpers.mapHeaderViews(callback, hv);

      // The new key should be applied to all hvs
      expect(result.path1.new).toEqual('item');
      expect(result.path2.new).toEqual('item');

      // Shouldn't mutate existing keys
      expect(result.path1.filename).toEqual('path1');
      expect(result.path2.filename).toEqual('path2');
    });
    it('should mutate entire hv if ...hv not returned', () => {
      const hv = {
        path1: {
          filename: 'path1',
          enabled: true,
        },
        path2: {
          filename: 'path2',
          enabled: false,
        },
      };

      const callback = () => ({
        only: 'item',
      });

      const result = helpers.mapHeaderViews(callback, hv);

      // Pre-existing keys no longer exist
      expect(result.path1.filename).toEqual(undefined);
      expect(result.path1.enabled).toEqual(undefined);
      expect(result.path2.filename).toEqual(undefined);
      expect(result.path2.enabled).toEqual(undefined);

      // Because we've mutated each hv
      expect(result.path1.only).toEqual('item');
      expect(result.path2.only).toEqual('item');
    });
  });
  describe('filterHeaderViews ()', () => {
    it('should filter based on callback', () => {
      const hv = {
        path1: {
          filename: 'path1',
          enabled: true,
        },
        excluded: {
          filename: 'excluded',
          enabled: false,
        },
      };

      const callback = (hv) => {
        return hv.enabled === true;
      };

      const result = helpers.filterHeaderViews(callback, hv);
      // '/path1' should exist
      expect(result.path1.enabled).toEqual(true);

      // '/excluded' should not exist anymore
      expect(result.excluded).toEqual(undefined);
    });
  });
});
