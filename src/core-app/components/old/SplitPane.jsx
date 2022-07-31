// src/components/SplitPane.jsx

/**
 * @module components/SplitPane
 *
 * @description
 * Lean capacity to control the pane width.
 */

import React from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@mui/styles/makeStyles';
import Container from '@mui/material/Container';

/* eslint react/jsx-props-no-spreading: "off" */
/* eslint consistent-return: "off" */

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  splitHandle: {
    border: '5px solid black',
    cursor: 'column-resize',
  },
  splitPaneLeft: {
    flex: '1',
    overflow: 'hidden',
    backgroundColor: 'blue',
  },
  splitPaneRight: {
    flex: '1',
    overflow: 'hidden',
    backgroundColor: 'green',
  },
});

/**
 * Context to store
 * 1. the width of the Left pane (when first rendering)
 * 2. a function to update that width (when dragging)
 *
 */
const splitPaneContext = React.createContext();

/**
 * SplitPane Component
 * @component
 */
const SplitPane = (props) => {
  const { leftPaneMinWidth, rightPaneMinWidth, children } = props;

  const classes = useStyles();

  // const leftPaneMaxWith = paneWidth - rightPanelMinWidth;

  const [leftWidth, setLeftWidth] = React.useState(null);

  // Ref is used to generate a side-effect such as
  // animation with the DOM. It is the counter to
  // changing children via props - a pure, declarative
  // approach.
  const separatorXPosition = React.useRef(null);

  // use access to the DOM to handle and mutate the
  // left pane.
  const splitPaneRef = React.createRef();

  const onMountDown = (e) => {
    separatorXPosition.current = e.clientX;
  };

  const onMouseMove = (e) => {
    if (!separatorXPosition.current) {
      return;
    }
    const newLeftWidth = leftWidth + e.clientX - separatorXPosition.current;
    separatorXPosition.current = e.clientX;

    // props.leftPaneMinWidth
    if (newLeftWidth <= leftPaneMinWidth) {
      return leftWidth !== 0 && setLeftWidth(leftPaneMinWidth);
    }
    const splitPaneWidth = splitPaneRef.current.clientWidth;
    const leftPaneMaxWidth = splitPaneWidth - rightPaneMinWidth;

    if (newLeftWidth >= leftPaneMaxWidth) {
      return leftWidth !== splitPaneWidth && setLeftWidth(leftPaneMaxWidth);
    }

    setLeftWidth(newLeftWidth);
  };

  const onMouseUp = () => {
    separatorXPosition.current = null;
  };

  React.useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  });

  return (
    <Container className={classes.root}>
      <splitPaneContext.Provider value={{ leftWidth, setLeftWidth }}>
        {children[0]}
        <div className='splitHandle' onMouseDown={onMountDown} />
        {children[1]}
      </splitPaneContext.Provider>
    </Container>
  );
};
/**
 * Compute the width of the Left pane. The right
 * pane width will be derived accordingly.
 */
SplitPane.Left = function SplitPaneLeft(props) {
  const { classes, ...childProps } = props;
  // get access to the DOM node
  const leftRef = React.createRef();
  // similar to useState... retrieve the context
  const { leftWidth, setLeftWidth } = React.useContext(splitPaneContext);

  // side-effect
  // catch the first render event when value is null
  React.useEffect(() => {
    if (!leftWidth) {
      setLeftWidth(leftRef.current.clientWidth);
      leftRef.current.style.flex = 'none';
    } else {
      leftRef.current.style.width = `${leftWidth}px`;
    }
  }, [leftRef, leftWidth, setLeftWidth]);

  return (
    <div {...childProps} className={classes.splitPaneLeft} ref={leftRef} />
  );
};

SplitPane.Right = function SplitPaneRight(props) {
  const { classes, ...childProps } = props;
  return <div {...childProps} className={classes.splitPaneRight} />;
};

SplitPane.propTypes = {
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
  leftPaneMinWidth: PropTypes.number,
  rightPaneMinWidth: PropTypes.number,
};

SplitPane.defaultProps = {
  leftPaneMinWidth: 10,
  rightPaneMinWidth: 10,
};

SplitPane.Left.propTypes = {
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
};

SplitPane.Right.propTypes = SplitPane.Left.propTypes;

export default SplitPane;
