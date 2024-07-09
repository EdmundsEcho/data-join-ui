import { useMemo } from 'react';

/**
 * Requires the object be seriazable.
 *
 * The hook will only memoize properties that are not included in
 * the list of ignoredProperties.
 *
 * The hook allows a component to prevent re-renders when ignored
 * properties change.
 */
export const useSelectMemoization = (filter, ignoredProperties = []) => {
  const filteredFilter = useMemo(() => {
    const newFilter = { ...filter };
    ignoredProperties.forEach((prop) => delete newFilter[prop]);
    return newFilter;
  }, [filter, ignoredProperties]);

  /* eslint-disable-next-line */
  return useMemo(() => filteredFilter, [JSON.stringify(filteredFilter)]);
};

export default useSelectMemoization;
