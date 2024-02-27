import React, { useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import { DeleteButton, ForwardArrow } from "./SymbolMapShared";

const SymbolMapItem = ({
  leftValue,
  rightValue: rightValueProp,
  onDelete,
  onUpdate,
  hideDelete,
  leftWidth,
  rightWidth,
  onUpdateStart,
  onUpdateEnd,
  ...fieldProps
}) => {
  const [rightValue, setRightValue] = useState(rightValueProp);

  const handleUpdate = () => {
    rightValue ? onUpdate(rightValue) : onDelete();
    onUpdateEnd();
  };
  return (
    <TableRow className="Luci-SymbolMapItem">
      <TableCell
        sx={{ width: leftWidth }}
        component="th"
        scope="row"
      >
        <TextField
          {...fieldProps}
          required
          fullWidth
          variant="standard"
          value={leftValue}
          InputProps={{
            readOnly: true,
          }}
          sx={{
            // Targeting the input element directly
            "& .MuiInputBase-input": {
              height: "20px",
            },
          }}
        />
      </TableCell>
      <TableCell>
        <ForwardArrow />
      </TableCell>
      <TableCell sx={{ width: rightWidth }}>
        <TextField
          {...fieldProps}
          required
          fullWidth
          variant="standard"
          value={rightValue}
          onFocus={onUpdateStart}
          onChange={(e) => {
            console.log("onChange: ", e.target.value);
            setRightValue(e.target.value);
          }}
          onBlur={handleUpdate}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              handleUpdate();
            }
          }}
          sx={{
            // Targeting the input element directly
            "& .MuiInputBase-input": {
              height: "20px",
            },
          }}
        />
      </TableCell>
      <TableCell>
        <DeleteButton
          hide={hideDelete}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};

SymbolMapItem.propTypes = {
  leftValue: PropTypes.string.isRequired,
  rightValue: PropTypes.string.isRequired,
  onDelete: PropTypes.func,
  onUpdate: PropTypes.func,
  hideDelete: PropTypes.bool,
  leftWidth: PropTypes.string.isRequired,
  rightWidth: PropTypes.string.isRequired,
  onUpdateStart: PropTypes.func,
  onUpdateEnd: PropTypes.func,
};

SymbolMapItem.defaultProps = {
  hideDelete: false, // By default, the delete icon is shown
  onUpdate: () => console.error("onUpdate not configured"),
  onDelete: () => console.error("onDelete not configured"),
  onUpdateStart: () => console.error("onUpdateStart not configured"),
  onUpdateEnd: () => console.error("onUpdateEnd not configured"),
};

export default SymbolMapItem;
