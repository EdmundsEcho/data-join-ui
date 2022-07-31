/**
 * @module components/LevelsView/component
 *
 * @description
 * Generic component used to display level tuples.
 * Levels must be in the form of [[ name, count ]]
 *
 * @deprecated
 *
 */
/*
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import LevelEditor from '../LevelEditor';
import LevelSpans from './LevelSpans';
import { prettyNumber, transformLevels } from '../../utils/common';
import { transformLevels } from '../../lib/filesToEtlUnits/headerview-helpers;

const LevelsView = ({ field, levels, showLevelEditor, arrows, onFieldChange }) => {
  const [ state, setState ] = useState ({
    editorOpen: false,
    levelIdx: null
  });

  const editLevels = (idx = null) => {
    setState ({ ...state, editorOpen: true, levelIdx: idx });
  };

  const handleSave = (arrows) => {
    setState ({ ...state, editorOpen: false, arrows })
    onFieldChange ('map-symbols.arrows', arrows);
  };

  const mspanIsValid = field => {
    return field.time.interval.count !== null && field.time.interval.unit !== null;
  }

  if (field && field.purpose === 'mspan' && field['levels-mspan'] && mspanIsValid (field)) return (
    <LevelSpans field={ field } spans={ field['levels-mspan']} />
  )

  console.log("AM I RELEBVANT?");

  return (
    <div>
      <LevelEditor
        open={ state.editorOpen }
        levels={ levels }
        levelIdx={ state.levelIdx }
        arrows={ arrows }
        onCancel={ () => setState ({ ...state, editorOpen: false }) }
        onSubmit={ handleSave }
      />
      { showLevelEditor && (
      <Button onClick={ () => editLevels () }>
        <EditIcon style={{ fontSize: 15 }} />
        Edit All
      </Button>
      )}
      <div style={{ overflowY: 'scroll', height: 210, paddingRight: 20 }}>
        <Table>
          <TableBody>
          { levels && transformLevels (levels, arrows).map ((level, idx) => (
            <TableRow key={ idx }>
              <TableCell>{ level[0] }</TableCell>
              <TableCell style={{ textAlign: 'right' }}>{ prettyNumber (level[1]) }</TableCell>
              { showLevelEditor && (
              <TableCell
                style={{ width: 15 }}>
                <EditIcon
                  onClick={ () => editLevels (idx) }
                  style={{ fontSize: 15 }}
                />
              </TableCell>
              )}
            </TableRow>
          ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

LevelsView.propTypes = {
  onFieldChange: PropTypes.func.isRequired,
  showLevelEditor: PropTypes.bool,
  levels: PropTypes.array.isRequired,
  arrows: PropTypes.object
};

LevelsView.defaultProps = {
  showLevelEditor: false
};

export default LevelsView;
*/
