import { createContext, useContext, useMemo } from 'react';
import { PropTypes } from 'prop-types';

export const SizeDataContext = createContext();
SizeDataContext.displayName = 'Context - SizeDataContext';

export const SizeApiContext = createContext();
SizeApiContext.displayName = 'Context - SizeApiContext';

/**
 * Make the core app width and height part of the context
 */
const Provider = ({ height: heightProp, width: widthProp, children }) => {
  const data = useMemo(
    () => ({ height: heightProp, width: widthProp }),
    [heightProp, widthProp],
  );
  // const api = useMemo(() => ({ setHeight, setWidth }), []);
  const api = undefined;

  return (
    <SizeDataContext.Provider value={data}>
      <SizeApiContext.Provider value={api}>{children}</SizeApiContext.Provider>
    </SizeDataContext.Provider>
  );
};

Provider.displayName = 'Provider-AppSizeContext';
Provider.propTypes = {
  children: PropTypes.node.isRequired,
  height: PropTypes.number,
  width: PropTypes.number,
};
Provider.defaultProps = {
  height: undefined,
  width: undefined,
};

export const useAppSizeDataContext = () => useContext(SizeDataContext);
export const useAppSizeApiContext = () => useContext(SizeApiContext);

export default Provider;
