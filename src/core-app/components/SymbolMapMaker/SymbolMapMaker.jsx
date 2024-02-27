import React, { useCallback, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import { useSelector, useDispatch } from "react-redux";
import {
  addOrUpdateItem,
  deleteItem,
} from "../../features/mapItems/mapItemsSlice";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import NewPair from "./AutocompleteNewPair";
import SymbolMapItem from "./SymbolMapItem";
import { DeleteButton, ForwardArrow } from "./SymbolMapShared";

const sortLevels = (levels) => levels.sort((a, b) => a.localeCompare(b));

// local placeholders
const LEFT_TITLE = "Old value";
const RIGHT_TITLE = "New value";
const MIN_DISPLAY_ROWS = 3;
const MIN_CHARS = 5;

/**
 * Input levels for a given field.
 * Builds a symbolMap for a given field.
 * Maintains a list of options = levels minus keys in the symbolMap
 *
 * @param {Object} props
 * @param {Array} props.levels
 * @param {Object} props.symbolsMap
 */
function SymbolMapMaker({ levels: levelsProp, onClose }) {
  const dispatch = useDispatch();
  const symbolItemsMap = useSelector((state) => state.mapItems.items || []);
  const symbolItems = Object.values(symbolItemsMap);
  const [levelOptions, setLevelOptions] = useState(
    sortLevels(levelsProp) || []
  );
  const [error, setError] = useState("");

  // child state; we track it to know when to prevent scrolling
  const [isUpdating, setIsUpdating] = useState(false);
  const handleStartUpdate = () => setIsUpdating(true);
  const handleEndUpdate = () => setIsUpdating(false);

  // to pull the scolling table body to the latest new entry
  const tableRef = useRef(null);

  // depends on font size and the initial levelsProp value
  let chars = levelsProp.reduce(
    (max, level) => Math.max(max, level.length),
    MIN_CHARS
  );

  const padding = 90;
  const leftWidth = `calc(${chars}ch + ${padding}px)`;
  const rightWidth = `calc(${chars + 0.3 * chars}ch + ${padding}px)`;

  const handleNewPair = useCallback((leftValue, rightValue) => {
    dispatch(addOrUpdateItem({ left: leftValue, right: rightValue }));
    // recompute the available options
    setLevelOptions((prevLevelOptions) =>
      prevLevelOptions.filter((option) => option !== leftValue)
    );
    //
  });

  // Update
  const handleUpdate = (oldValue, newValue) => {
    dispatch(addOrUpdateItem({ left: oldValue, right: newValue }));

    setLevelOptions((prevLevelOptions) =>
      prevLevelOptions.filter((option) => option !== oldValue)
    );
  };

  // Delete
  const handleDelete = (leftValue) => {
    // forces this component to re-render
    dispatch(deleteItem({ left: leftValue }));

    // forces the NewPair component to re-render
    setLevelOptions((prevLevelOptions) =>
      sortLevels([...prevLevelOptions, leftValue])
    );
  };

  // effect that scrolls the table body when making new
  // entries (not when updating an existing entry)
  useEffect(() => {
    if (!isUpdating && tableRef.current) {
      const { current: container } = tableRef;
      container.scrollTop = container.scrollHeight;
    }
  }, [symbolItems]);

  return (
    <Box
      display="flex"
      justifyContent="center"
    >
      <Box
        className="Luci-SymbolMapMaker"
        sx={{
          "& .MuiCard-root": {
            padding: "1em",
          },
          "& .MuiTableCell-head": {
            paddingTop: "0.5em",
            paddingBottom: "0.1em",
          },
          "& .title": {
            margin: "0",
          },
        }}
      >
        <Card sx={{ flex: "0 1 auto", overflow: "hidden" }}>
          <TableContainer
            ref={tableRef}
            sx={{ maxHeight: "40vh", minHeight: "200px", overflow: "auto" }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: leftWidth }}>
                    <h2 className="title">{LEFT_TITLE}</h2>
                  </TableCell>
                  <TableCell>
                    <ForwardArrow hide />
                  </TableCell>
                  <TableCell sx={{ width: rightWidth }}>
                    <h2 className="title">{RIGHT_TITLE}</h2>
                  </TableCell>
                  <TableCell>
                    <DeleteButton hide />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Rows for each SymbolMapItem */}
                {symbolItems.map((pair) => (
                  <SymbolMapItem
                    key={pair.left}
                    leftValue={pair.left}
                    rightValue={pair.right}
                    onDelete={() => handleDelete(pair.left)}
                    onUpdate={(newValue) => handleUpdate(pair.left, newValue)}
                    leftWidth={leftWidth}
                    rightWidth={rightWidth}
                    onUpdateStart={handleStartUpdate}
                    onUpdateEnd={handleEndUpdate}
                    onError={setError}
                  />
                ))}
                {/* Placeholder Rows */}
                {Array.from({
                  length: Math.max(MIN_DISPLAY_ROWS - symbolItems.length, 0),
                }).map((_, index) => (
                  <SymbolMapItem
                    key={`placeholder-${index}`}
                    leftValue=""
                    rightValue=""
                    leftWidth={leftWidth}
                    rightWidth={rightWidth}
                    hideDelete
                    disabled
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TableContainer>
            <Table
              className="footer"
              sx={{
                "& .MuiTableCell-body": {
                  borderBottom: "None",
                  borderTop: "1px solid rgba(224, 224, 224, 1)",
                  paddingTop: "2em",
                },
              }}
            >
              <TableBody>
                {/* Row for NewPair entry */}
                <NewPair
                  options={levelOptions}
                  onSubmit={handleNewPair}
                  leftWidth={leftWidth}
                  rightWidth={rightWidth}
                  leftLabel="Old"
                  rightLabel="New"
                  onError={setError}
                />
              </TableBody>

              <TableFooter>
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="right"
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      p={1}
                    >
                      {error ? (
                        <Box sx={{ paddingRight: "1em" }}>
                          <Typography
                            variant="body1"
                            color="error"
                          >
                            {error}
                          </Typography>
                        </Box>
                      ) : (
                        <span>&nbsp;</span>
                      )}
                      <Button
                        variant="contained"
                        onClick={onClose}
                        color="primary"
                      >
                        Done
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Card>
      </Box>
    </Box>
  );
}

SymbolMapMaker.propTypes = {
  levels: PropTypes.arrayOf(PropTypes.string).isRequired,
  symbolsMap: PropTypes.arrayOf(
    PropTypes.shape({
      left: PropTypes.string.isRequired,
      right: PropTypes.string.isRequired,
    })
  ),
};

SymbolMapMaker.defaultProps = {
  symbolsMap: [],
};

export default SymbolMapMaker;
