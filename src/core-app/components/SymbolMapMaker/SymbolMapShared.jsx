import React from "react";

import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export const DeleteButton = ({ hide, onDelete }) => (
  <IconButton
    sx={{
      visibility: hide ? "hidden" : "visible",
      fontSize: "1.2em",
    }}
    aria-label="delete"
    onClick={onDelete}
  >
    <DeleteIcon sx={{ fontSize: "1.2em" }} />
  </IconButton>
);

export const ForwardArrow = ({ hide }) => (
  <ArrowForwardIosIcon
    sx={{
      visibility: hide ? "hidden" : "visible",
      fontSize: "1.2em",
    }}
  />
);
