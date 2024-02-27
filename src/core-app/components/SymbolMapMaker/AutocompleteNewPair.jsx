import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";

import { DeleteButton, ForwardArrow } from "./SymbolMapShared";

// todo: move to constants errors
const LEFT_ERROR = (value) =>
  `Select which field value to scrub. ${value} does not exist.`;

const RIGHT_ERROR = ({ value, type }) => {
  const errors = {
    match: "The new scrub value matches the original value.",
    missing: `Missing the new scrubed version of ${value}.`,
  };
  return errors[type];
};

const AutocompleteNewPair = ({
  options,
  onSubmit,
  onError,
  leftLabel,
  rightLabel,
  leftWidth,
  rightWidth,
}) => {
  const [leftInputValue, setLeftInputValue] = useState(""); // Renamed from leftFreesoloValue for clarity
  const [leftInput, setLeftInput] = useState(""); // Now using leftInput to track the submitted value
  const [rightValue, setRightValue] = useState("");
  const [rightOptions, setRightOptions] = useState([]);
  const [leftInputError, setLeftInputError] = useState(false);
  const [rightInputError, setRightInputError] = useState(false);
  const leftInputRef = useRef(null); // Ref for the left Autocomplete input

  // reset state
  const clearFields = () => {
    setLeftInputValue("");
    setLeftInput("");
    setRightValue("");
    setRightOptions([]);
    setLeftInputError(false);
    setRightInputError(false);
    if (leftInputRef.current) {
      leftInputRef.current.focus();
    }
  };

  const handleSubmit = () => {
    const leftValue = (leftInputValue || leftInput || "").trim();
    if (leftValue === rightValue) {
      setRightInputError(true);
      onError(RIGHT_ERROR({ type: "match" }));
    } else if (!rightValue) {
      onError(RIGHT_ERROR({ type: "missing", value: leftValue }));
    } else {
      onError(null);
      onSubmit(leftValue, rightValue);
      clearFields();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  const handleRightBlur = () => {
    handleSubmit();
  };

  const isValidLeftValue = (value) => options.includes(value);

  const handleLeftBlur = () => {
    const value = leftInputValue || leftInput;
    const error = !isValidLeftValue(value);
    setLeftInputError(error);
    if (error) {
      onError(LEFT_ERROR(value));
    }
    if (!error) {
      setRightOptions([value]); // Use leftInput to set right options if valid
      onError(null);
    }
  };

  const handleLeftInputChange = (newValue) => {
    console.log("Left value change: ", newValue);
    console.log("Left state value: ", leftInputValue);
    setLeftInputValue(newValue);
  };

  return (
    <TableRow className="Luci-AutocompleteNewPair">
      <TableCell sx={{ width: leftWidth }}>
        <Autocomplete
          freeSolo
          fullWidth
          disableClearable
          options={options}
          inputValue={leftInputValue} // Controlled input text
          onInputChange={(_, newInputValue) => {
            handleLeftInputChange(newInputValue);
          }}
          onChange={(_, newValue) => {
            setLeftInputValue(newValue ?? "");
            if (newValue && isValidLeftValue(newValue)) {
              setLeftInput(newValue);
            } else {
              setLeftInput("");
            }
          }}
          onBlur={handleLeftBlur}
          renderInput={(params) => (
            <TextField
              {...params}
              type="search"
              label={leftLabel}
              inputRef={leftInputRef}
              error={leftInputError}
              fullWidth
            />
          )}
        />
      </TableCell>
      <TableCell>
        <ForwardArrow hide />
      </TableCell>
      <TableCell sx={{ width: rightWidth }}>
        <Autocomplete
          fullWidth
          options={rightOptions}
          value={rightValue}
          onInputChange={(event, newValue) => setRightValue(newValue)}
          onKeyDown={handleKeyDown}
          onBlur={handleRightBlur}
          renderInput={(params) => (
            <TextField
              {...params}
              label={rightLabel}
              error={rightInputError}
              fullWidth
            />
          )}
        />
      </TableCell>
      <TableCell>
        <DeleteButton hide />
      </TableCell>
    </TableRow>
  );
};

AutocompleteNewPair.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSubmit: PropTypes.func,
  onError: PropTypes.func,
  leftLabel: PropTypes.string,
  rightLabel: PropTypes.string,
  leftWidth: PropTypes.string.isRequired,
  rightWidth: PropTypes.string.isRequired,
};
AutocompleteNewPair.defaultProps = {
  onSubmet: () => console.warn("onSubmit not yet specified"),
  leftLabel: "Left",
  rightLabel: "Right",
};

export default AutocompleteNewPair;
