/**
 * @module components/Theme
 *
 * @description
 * Injects a theme
 *
 * The overrides and palette are the workhorses for the module.
 *
 */
import React from 'react';
import { alpha, createTheme, responsiveFontSizes } from '@mui/material/styles';

import Check from '@mui/icons-material/Check';
import Clear from '@mui/icons-material/Clear';

import palette from './assets/scheme/palette.json';
// used to create a customer version starting with mui's default
import { FIELD_TYPES, PURPOSE_TYPES } from './lib/sum-types';

// const LuciviaOrange = '#FF9445'; // eslint-disable-line
/* eslint-disable */

/**
 * Custom theme that is supposed to overwrite the default theme
 * where the props overlap.
 *
 * Residual specs in:
 *
 *      👉 headerview and etlview.styles.js
 *      👉 index.css
 *
 * Resources:
 *
 *     🔗 Flexbox: https://tympanus.net/codrops/css_reference/flexbox/
 *     🔗 Flexbox: https://the-echoplex.net/flexyboxes/
 *     👉 kindle Mui custom formatting
 *
 * Mui base theme:
 *
 *     👉 console.dir(muiBaseTheme);
 *     👉 mui-default.json
 *
 *
 */

/**
 * Use the base theme as a starting point
 */
const muiBaseTheme = responsiveFontSizes(createTheme());
// console.dir(muiBaseTheme);
/*
 * provide ~global ref
 */
const spacing = [0, 2, 4, 6, 10, 14, 20, 26, 32, 38, 48, 58, 64];
const spacingFn = (value) => `${spacing[value]}px`;

// 🔖 Workbench
// min set by etlUnit time parameter
const SUPER_GROUP_MIN_WIDTH = '257px';
const GROUP_BORDER_RADIUS = spacingFn(3);

export default createTheme({
  spacingFn,

  palette: {
    ...palette,
    useNextVariants: true,
  },
  typography: {
    // rem font-size set in index.css
    fontFamily: [
      'Rubik',
      'Lato',
      'Roboto',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),

    headline1: {
      fontFamily: 'rubik',
    },
    headline2: {
      fontFamily: 'rubik',
    },
    headline3: {
      fontFamily: 'rubik',
    },
    headline4: {
      fontFamily: 'rubik',
    },
    headline5: {
      fontFamily: 'rubik',
    },
    headline6: {
      fontFamily: 'rubik',
    },
    subtitle1: {
      fontFamily: 'lato',
    },
    subtitle2: {
      fontFamily: 'lato',
    },
    body1: {
      fontFamily: 'Lato',
      fontSize: '1rem',
      fontWeight: '400',
      color: palette.grey[600],
    },
    body2: {
      fontFamily: 'Lato',
      fontSize: '0.9rem',
      fontWeight: '400',
      color: palette.grey[600],
    },
    // ⬜ integrate with other etlUnit overrides
    etlUnit: {
      componentsHelperText: {
        fontFamily: 'Lato',
        fontSize: '0.6rem',
        lineHeight: '0.6rem',
        color: palette.primary.main,
      },
      componentsInputLabel: {
        fontFamily: 'Lato',
        fontSize: '0.6rem',
        lineHeight: '0.6rem',
      },
      componentsInputText: {
        fontFamily: 'Lato',
        fontSize: '0.8rem',
      },
    },
    componentsInputTextSpanInput: {
      fontFamily: 'Lato',
      fontSize: '10px',
      lineHeight: '19px',
    },
    // button
    button: {
      fontFamily: 'lato',
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'none',
    },
    // e.g., helper text in text field
    caption: {
      fontFamily: 'lato',
    },
    overline: {
      fontFamily: 'lato',
    },
    meta: {
      fontFamily: 'lato',
    },
  },
  shape: {
    borderRadius: 16,
  },
  // specified up-top
  spacing,

  components: {
    //--------------------------------------------------------------------------
    MuiCssBaseline: {
      styleOverrides: `
          html: {
            -webkit-font-smoothing: 'auto',
          }
        `,
    },

    MuiCheckbox: {
      defaultProps: {
        disableRipple: true,
        checkedIcon: <Check color='primary' />,
        icon: <Clear />,
      },
    },

    //--------------------------------------------------------------------------
    /* Table */
    //--------------------------------------------------------------------------
    MuiTable: {
      styleOverrides: {
        root: ({ theme }) => ({
          // default
          '& thead tr th, & tbody tr td': {
            padding: `${theme.spacingFn(3)} ${theme.spacingFn(3)}`,
          },
          '& thead tr': {
            verticalAlign: 'bottom',
          },
          '& tbody tr': {
            cursor: 'pointer',
          },
          '& thead tr th': {
            paddingTop: spacingFn(5),
            paddingBottom: spacingFn(3),
            backgroundColor: theme.palette.grey[200],
          },
          '& thead tr th:first-of-type svg': {
            marginBottom: '-4px',
          },
          // last cell: more space on the right
          '& thead tr th:last-child': {
            paddingRight: spacingFn(5),
          },
          '& tbody tr td:last-child': {
            paddingRight: spacingFn(5),
          },
          '& tbody tr:last-child td': {
            border: 'none',
          },
          '& .Luci-Toggle': {
            width: '40px',
            '& .MuiIconButton-root': {
              '&.expand': {
                transform: 'rotate(0deg)',
                marginLeft: 'auto',
                transition: theme.transitions.create('transform', {
                  duration: theme.transitions.duration.shortest,
                }),
              },
              '&.expandOpen': {
                transform: 'rotate(180deg)',
              },
              '&.hidden': {
                visibility: 'hidden',
              },
            },
          },
          //--------------------------------------------------------------------
          // Specialized tables
          //--------------------------------------------------------------------
          '&.Luci-Table': {
            //--------------------------------------------------------------------
            // HeaderView fields
            //--------------------------------------------------------------------
            '&.headerView': {
              tableLayout: 'fixed',
              '& thead tr th[class*=excludeCell]': { width: '40px' },
              '& thead tr th[class*=fieldnameCell]': { width: '23%' },
              '& thead tr th[class*=aliasCell]': { width: '22%' },
              '& thead tr th[class*=purposeCell]': { width: '25%' },
              '& thead tr th[class*=levelsCell]': { width: '10%' },
              '& thead tr th[class*=nullsCell]': { width: '10%' },
              '& thead tr th[class*=toggleDetailCell]': { width: '40px' },
            },
            '&.headerView, &.factorNames': {
              '& .MuiTableCell-head': {
                backgroundColor: theme.palette.secondary.superLight,
              },
            },
            //--------------------------------------------------------------------
            // wide-to-long configuration
            //--------------------------------------------------------------------
            '&.factorNames': {
              width: '100%',
              tableLayout: 'fixed',
              '& .MuiTableCell-head': {
                backgroundColor: theme.palette.secondary.superLight,
              },
              '& thead tr th:first-of-type': {
                width: '170px',
              },
              '& tbody tr td': {
                border: 'none',
              },
              '& tbody tr[class*=nowInView] td': {
                borderBottom: `1.5px solid ${theme.palette.grey[300]}`,
              },
              '& thead tr th:last-child': {
                width: '50px',
              },
              '& tr[class*=summaryView] .MuiTableCell-body': {
                '& .MuiInputBase-root': {
                  color: theme.palette.primary.main,
                  fontStyle: 'italic',
                },
              },
            },
            '&.fieldNames': {
              '& .MuiTableCell-head.factorName': {
                color: theme.palette.primary.main,
                fontStyle: 'italic',
                fontSize: '1.2rem',
                '& div[class*=WideToLongCard]': {
                  maxWidth: '194px', // input + 50% menu button
                },
              },
              '& .MuiTableCell-body': {
                border: 'none',
              },
              '& tbody tr:last-child td': {
                paddingBottom: spacingFn(7),
                borderBottom: `2px solid ${theme.palette.grey[300]}`,
              },
            },
            //--------------------------------------------------------------------
            // Etl fields
            //--------------------------------------------------------------------
            '&.etlFields, &.etlUnitMeas': {
              '& .MuiTableCell-head': {
                backgroundColor: theme.palette.grey[200],
                position: 'relative',
                height: '56px',
                '&.MuiTableCell-alignCenter': {
                  padding: 0,
                },
                '& .headerWrapper': {
                  position: 'absolute',
                  bottom: 3,
                },
              },
              '& .Luci-Table-Row': {
                height: '43px',
              },
              '& .selected': {
                backgroundColor: theme.palette.primary.superLight,
              },
              '& .trashCell': {
                width: '70px',
                '& .MuiIconButton-root': {
                  padding: '5px',
                  margin: '3px',
                  '&.hidden': {
                    display: 'none',
                  },
                  '&.hover': {
                    opacity: 0.3,
                    '&:hover': {
                      opacity: 1,
                      color: theme.palette.primary.main,
                    },
                  },
                },
              },
            },
            //--------------------------------------------------------------------
            // EtlField view measurement
            //--------------------------------------------------------------------
            '&.etlUnitMeas': {
              '& .Luci-SummaryDetail-Row': {
                '&.summaryView': {
                  height: '45px',
                  '& .MuiTableCell-body': {
                    borderBottom: 'none',
                    borderTop: '1px solid #ccc',
                    // backgroundColor: palette.secondary.extremeLight,
                  },
                },
              },
              '&.detailView': {
                '& .MuiTableCell-body': {
                  borderBottom: 'none',
                },
                '& .iconCell': {
                  // half the width of the toggler =20 +
                  // half width of toggler svg =9 +
                  // desired width of the icon
                  width: '70px',
                },
              },
              // coordinate with addMeaImpliedFieldButton
              '& .componentCountCell': {
                display: 'flex',
                justifyContent: 'center',
                '& .MuiTypography-root': {
                  marginTop: '5px',
                  marginBottom: '0px',
                  marginLeft: 'auto',
                },
              },
            },
          },
          //--------------------------------------------------------------------
          // Directory view
          //
          // 🔖 see MuiTableContainer-root
          //    used to set max-height required for scrolling
          //
          // "& tbody tr td div[class*='Luci-buttonGroup']": {
          //
          //--------------------------------------------------------------------
          '&.Luci-Table-fileDirectory': {
            '& thead tr th, & tbody tr td': {
              fontSize: '0.9em',
            },
            '& tbody tr': {
              verticalAlign: 'top',
            },
            '& tbody tr td:not(:last-child)': {
              paddingTop: '8px',
            },
            '& tbody tr td:last-child': {
              verticalAlign: 'bottom',
              paddingTop: '6px',
              paddingBottom: '8px',
            },
            '& tbody tr:last-child td': {
              // marginBottom: '100px',
            },
            // max-out space for filename
            "& thead tr th[class*='filename'], & tbody tr td[class*='filename']":
              {
                paddingLeft: 0,
                paddingRight: 0,
              },
            '& .filesize': {
              whiteSpace: 'nowrap',
            },
            '& .filename': {
              fontSize: '0.85em',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              hyphens: 'auto',
            },
            "& tbody tr td svg[class*='folderIcon']": {
              color: theme.palette.primary.light,
              marginTop: '6px',
            },
            '& tbody tr td:first-of-type, & thead tr th:first-of-type': {
              position: 'sticky',
              width: '50px',
              minWidth: '50px', // required to prevent jitter
              maxWidth: '50px',
              left: '0px',
              padding: 0,
            },
          },
        }),
      },
    },
    //
    //
    //--------------------------------------------------------------------------
    /* TableContainer */
    // useful tagging approach for components encoded using html elements
    //--------------------------------------------------------------------------
    MuiTableContainer: {
      styleOverrides: {
        root: {
          '& .Luci-Table-Sources': {
            '&.sequence': {
              float: 'left',
              '& tbody tr td': {
                height: '50px',
                '& p': {
                  marginBottom: '-3px',
                },
              },
            },
            '&.filenames': {
              float: 'left',
              width: `90%`,
            },
          },
          // see also parent MuiTableContainer DirectoryView (parent)
          '&.Luci-DirectoryView': {
            marginBottom: 'auto', // 🛈  this when parent is block?
            flex: 1, // 🛈  this when parent is flex
            overflow: 'inherit',
            // height: 'calc(100vh - 244px)',
            // 234 = footer: 122, appBar: 48, searchBar: 64
            // margin of error provided by last row padding
          },
        },
      },
    },
    // ⬜ may want to link using via tbody tr
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.Luci-SummaryDetail-Row': {
            '&.summaryView': {
              borderBottom: '1px solid rgba(224,224,224,0)',
              '& > *': {
                borderBottom: 'none',
              },
              '& .MuiTableCell-root': {
                border: 'none',
                '& .MuiButtonBase-root': {
                  padding: `${spacingFn(3)} ${spacingFn(3)}`,
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.1rem',
                  },
                },
                '& .MuiTypography-root': {
                  fontSize: '0.9rem',
                },
              },
              '&.selected': {
                backgroundColor: palette.primary.superLight,
              },
              '&.disabled': {
                opacity: '0.5',
              },
            },
            // collapsable row (paired with summary row)
            '&.detailView': {
              '& .MuiTableCell-root': {},
            },
          },
          '&.header.factorNames': {
            '& .MuiTableCell-root': {},
          },
          '&.header.fieldNames': {
            '& .MuiTableCell-root': {},
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        // cell variant head
        head: {
          paddingTop: '16px',
          backgroundColor: palette.grey[100],
        },

        // table cell padding='checkbox'
        paddingCheckbox: {
          padding: '2px',
        },
        // table cell size='small'
        sizeSmall: {
          fontSize: '0.9rem',
        },
      },
    },
    //--------------------------------------------------------------------------
    // For inputs not part of a FormControl
    //
    MuiInputBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.MuiInputBase-spanInput-01': {
            marginTop: theme.spacing(0),
          },
        }),
      },
    },
    MuiFormControl: {
      defaultProps: {
        variant: 'standard',
      },
      styleOverrides: {
        root: (/* theme */) => ({
          '&.LuciSelectMenu': {
            minWidth: '36px',
            '&.derivedField': {
              minWidth: '80px',
            },
          },
          // 🚧 generic Luci-Texfield
          // has: InputLabel, FormHelperText & wrapped Input as TextInput
          //--------------------------------------------------------------------------
          /* Luci text field */
          //--------------------------------------------------------------------------
          '&.Luci-TextField': {
            '& .MuiInputLabel-root': {
              '&.MuiFormLabel-root': {},
              '&.Mui-focused': {},
            },
            '& .MuiFormHelperText-root': {},
          },
          '&.Luci-FileField-FormControl': {
            display: 'flex',
            maxWidth: '180px',
          },
          // class tag
          '& .EtlUnit-CardHeader-TextField': {
            marginBottom: '3px',
            // force specialization
            '&.MuiInput-underline': {
              '&:before': {
                borderBottomWidth: '0.5px',
              },
              '&:after': {
                borderBottomWidth: '1.0px',
              },
            },
            // child-component
            '& .MuiInputBase-input': {
              padding: '6px 0px 4px',
            },
          },
        }),
      },
    },
    //--------------------------------------------------------------------------
    /* Fab */
    MuiFab: {
      styleOverrides: {
        root: { minHeight: '30px' },
        sizeSmall: { width: '30px', height: '30px' },
        sizeMedium: { width: '40px', height: '40px' },
      },
    },
    //--------------------------------------------------------------------------
    /* DataGrid */
    MuiDataGrid: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: '0.8rem',
          lineHeight: '0.8rem',
          fontFamily: 'Rubik',
          cursor: 'pointer',
          border: `none`,
          padding: '0',
          margin: '0',
          '&.Luci-ValueGrid-matrix': {
            '& .fieldname': {
              padding: 0,
              '& .MuiDataGrid-iconButtonContainer': {
                marginRight: '-7px',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                height: 'max-content',
                fontSize: '0.9em',
                lineHeight: '1.1em',
                whiteSpace: 'normal',
                overflowWrap: 'break-word',
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                hyphens: 'auto',
              },
            },
          },
          // DataGrid className
          '&.EtlUnit-ValueGrid, &.Luci-ValueGrid-fileLevels, &.Luci-ValueGrid-matrix':
            {
              // reverse how a selected/non-selected row renders
              '& .EtlUnit-ValueGrid-Level': {
                opacity: '1.0',
                '&.Mui-selected': {
                  opacity: '0.6',
                  backgroundColor: 'inherit',
                },
              },
              '& .record-counts': {
                marginRight: theme.spacingFn(3),
              },
              // root and another class
              '& .MuiDataGrid-checkboxInput': {
                '& .MuiSvgIcon-root': {
                  width: '1.0rem',
                  height: '1.0rem',
                },
              },
              // root and another class
              '& .MuiDataGrid-main': {
                '& .MuiDataGrid-columnsContainer': {
                  backgroundColor: theme.palette.grey[300],
                },
              },
              // root and another class
              '& .MuiDataGrid-footer': {
                minHeight: '20px',
                maxHeight: '25px',
                padding: `${spacingFn(0)}`,
                margin: `${spacingFn(2)} 0px`,
                justifyContent: 'space-between',
                backgroundColor: theme.palette.grey[100],
                display: 'flex',
                alignItems: 'center',
                '& .tools': {
                  '& .MuiIconButton-sizeSmall': {
                    color: theme.palette.primary.main,
                    '&.Mui-disabled': {
                      color: 'inherit',
                    },
                    '& > *:first-of-type': {
                      '& > *:first-of-type': {
                        // svg-icon
                        fontSize: '1.1rem',
                      },
                    },
                  },
                },
                '& .MuiTablePagination-root': {
                  '& .MuiTablePagination-toolbar': {
                    minHeight: '20px',
                  },
                  '& .MuiToolbar-root': {
                    '& .MuiTypography-body2': {
                      fontSize: '0.7rem',
                      lineHeight: '0.7rem',
                    },
                    '& .MuiTablePagination-actions': {
                      '& .MuiButtonBase-root': {
                        fontSize: '0.8rem',
                        lineHeight: '0.8rem',
                        padding: '3px',
                        '& .MuiIconButton-label': {
                          '& .MuiSvgIcon-root': {
                            fontSize: '1.2rem',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
        }),
      },
    },
    //--------------------------------------------------------------------------
    /* Toolbar */
    MuiToolbar: {
      styleOverrides: {
        dense: {
          '&.Luci-DirectoryView': {
            minHeight: 'min-content',
          },
        },
        root: {
          '&.Luci-DirectoryView': {
            width: '100%',
          },
        },
      },
    },
    //--------------------------------------------------------------------------
    /* Grid */
    MuiGrid: {
      styleOverrides: {
        root: ({ theme }) => ({
          //----------------------------------------------------------------------
          // Overview-steps
          //----------------------------------------------------------------------
          '&.Luci-Overview-step': {
            justifyContent: 'flex-start',
            alignItems: 'center',
            alignContent: 'center',
            '& .stepIcon': {
              width: '40px',
              height: '40px',
              marginRight: theme.spacingFn(4),
              borderRadius: '50%',
              alignContent: 'center',
              justifyContent: 'center',
              '&.done': {
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.secondary.contrastText,
              },
              '&.todo': {
                display: 'flex',
                width: '40px',
                height: '40px',
                '& p': {
                  backgroundColor: theme.palette.secondary.contrastText,
                  color: theme.palette.secondary.main,
                  margin: 'auto',
                },
                border: `2px solid ${theme.palette.secondary.main}`,
              },
            },
          },
          //----------------------------------------------------------------------
          // ValueGrid-actions
          //----------------------------------------------------------------------
          [`&.${FIELD_TYPES.ETL}  .Luci-ValueGrid-header`]: {
            marginTop: '-12px',
            marginBottom: '11px',
          },
          '&.Luci-ValueGrid-actions': {
            marginLeft: 'auto',
            [`&.${FIELD_TYPES.ETL}`]: {
              marginTop: '-5px',
            },
          },
          //----------------------------------------------------------------------
          // HeaderView-summary
          //----------------------------------------------------------------------
          '&.Luci-HeaderView-summary': {
            '& .fieldCount': {
              marginLeft: spacingFn(5),
              '& .MuiTypography-root': {
                fontSize: '0.8rem',
                '& span[class*=count]': {
                  fontWeight: '700',
                },
              },
            },
            '& .rowCount': {
              '& .MuiTypography-root': {
                color: theme.palette.meta.main,
                fontSize: '0.8rem',
              },
            },
          },
          //----------------------------------------------------------------------
          // HeaderView-actions
          //----------------------------------------------------------------------
          '&.Luci-HeaderView-Actions': {
            justifyContent: 'flex-end',
            alignContent: 'space-between',
            height: '80px',
            width: '130px',
            '&.switch': {
              marginLeft: 'auto',
            },
            '& button': {
              padding: spacingFn(2),
              margin: `${spacingFn(3)} 0`,
              '&.expandIcon': {
                marginLeft: `auto`,
                transform: 'rotate(0deg)',
                transition: theme.transitions.create('transform', {
                  duration: theme.transitions.duration.shortest,
                }),
                '&.expandOpen': {
                  transform: 'rotate(180deg)',
                },
              },
              '&.closeIcon': {
                marginRight: `auto`,
              },
            },
          },
          //----------------------------------------------------------------------
          // FileField (also default for to EtlField)
          //----------------------------------------------------------------------
          // FileField DetailView (collapse)
          '&.Luci-FileField.root.detail': {
            display: 'flex',
            flexWrap: 'wrap',
            width: 'auto',
            height: 'auto',
            boxSizing: 'border-box',
            marginTop: theme.spacingFn(3),
            marginBottom: theme.spacingFn(3),
            marginLeft: theme.spacingFn(1),
            marginRight: theme.spacingFn(3),
            // 🔖 track with sources box
            '& .inputGroup': {
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              alignContent: 'flex-start',
              gap: '1rem 0px',
              minWidth: '185px', // directly measured; avoid changing
              paddingLeft: '0px',
              paddingBottom: theme.spacingFn(4),
              margin: theme.spacingFn(0),
              '& .MuiGrid-item': {
                padding: '0px',
                // marginBottom: theme.spacingFn(5),
              },
              '& .MuiFormHelperText-root': {
                color: theme.palette.grey[500],
                lineHeight: '1.1rem',
                textShadow: 'none',
              },
              '& .timeConfig': {
                margin: '0px',
                gap: '0.4rem 0px',
                '& div': {
                  marginBottom: '0px',
                },
                '& .MuiGrid-container': {
                  alignItems: 'center',
                },
              },
            },
            //--------------------------------------------------------------------
            // Levels
            //--------------------------------------------------------------------
            '& .levels': {
              // marginLeft: 'auto',
              display: 'flex',
              flexDirection: 'column',
              width: 'auto',
              height: 'auto',
              justifyContent: 'center',
              alignItems: 'flex-start', // top is the default
              alignContent: 'center',
              [`&.${PURPOSE_TYPES.SUBJECT}, &.${PURPOSE_TYPES.MVALUE}`]: {
                alignItems: 'center',
              },
              [`&.${PURPOSE_TYPES.QUALITY}, &.${PURPOSE_TYPES.MCOMP}`]: {
                height: '100%', // prevents jitter when loading fetched results
              },
              //------------------------------------------------------------------
              // Levels-statsSummary
              //------------------------------------------------------------------
              '& .statsSummary': {
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'center',
                '&.error': {
                  width: 'auto',
                },
                // anti-pattern to use margins in grid
                '& .title': {},
                '& .left': {},
                '& .right': {},
              },
              //------------------------------------------------------------------
              // mspan chips
              //------------------------------------------------------------------
              '& .Luci-FileField-LevelSpans': {
                height: '100%',
                width: '100%',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'center',

                '&.singleton, &.belowCapacity': {},
                '&.atCapacity, &.aboveCapacity': {
                  overflowY: 'scroll',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  alignContent: 'center',
                },
                //----------------------------------------------------------------------
                // mspan chip
                //----------------------------------------------------------------------
                '& .Luci-SpanLevel-Chip': {
                  borderRadius: 4,
                  display: 'flex',
                  boxShadow: theme.shadows[1],
                  paddingTop: spacingFn(3),
                  paddingRight: spacingFn(5),
                  paddingBottom: spacingFn(3),
                  paddingLeft: spacingFn(3),
                  backgroundColor: theme.palette.primary.superLight,
                  margin: `${theme.spacingFn(3)} ${theme.spacingFn(3)}`,
                  height: 'min-content',
                  width: 'max-content',
                  '& .title': {
                    color: theme.palette.grey['700'],
                    lineHeight: '1.0',
                  },
                  '& .subtitle': {
                    color: theme.palette.grey['500'],
                  },
                  '& .icon': {
                    flex: 0,
                    marginTop: 6,
                    marginRight: 10,
                  },
                },
              },
            },
          },
          //----------------------------------------------------------------------

          '&.Luci-Toolbar': {
            '& .path': {
              fontSize: '0.94em',
            },
            '& .fileCount': {
              borderRadius: 9,
              fontSize: '0.5em',
              marginLeft: 5,
              padding: '1px 6px',
              marginBottom: '-4px',
              backgroundColor: theme.palette.grey[500],
              color: theme.palette.primary.contrastText,
              whiteSpace: 'pre',
              height: 'min-content',
            },
          },

          '&.Luci-Workbench-Instructions': {
            margin: `${theme.spacingFn(4)}`,
            columnGap: `${theme.spacingFn(5)}`,
            width: 'auto',
            '& .MuiTypography-root': {
              fontSize: '0.7rem',
              lineHeight: '0.7',
            },
          },
        }),
      },
    },
    //--------------------------------------------------------------------------
    /* Dialog */
    'MuiDialog-paper': {},
    MuiDialogContent: {
      styleOverrides: {
        root: {
          '&.MuiMatrix-Dialog': {
            height: 'calc(100vh - 50px)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Luci-Dialog.root': {
            '& .actions.confirm': {
              marginRight: theme.spacing(5),
              marginBottom: theme.spacing(5),
            },
            '& .actions.save': {
              margin: theme.spacing(5),
            },
          },
          // 🦀 likely deprecated
          '&.Luci-HeaderViews.dialog': {
            '& .MuiDialogTitle-root': {
              '& .MuiIconButton-root': {
                position: 'absolute',
                right: theme.spacing(2),
                top: theme.spacing(2),
              },
            },
          },
        }),
      },
    },
    //--------------------------------------------------------------------------
    // Used in the EtlUnitCardHeader
    /* Icon */
    MuiIcon: {
      styleOverrides: {
        root: {
          '&.EtlUnit-CardHeader-Icon': {
            display: 'flex',
            fontSize: '2rem',
            alignItems: 'center',
            justifyContent: 'flex-end',
            width: 'auto',
            height: 'auto',
            '& .small': {
              justifyContent: 'flex-end',
              fontSize: '1.6rem',
            },
          },
        },
      },
    },
    //--------------------------------------------------------------------------
    /* Switch */
    // MuiSwitch-switchBase +/- MuiSwitch-checked
    //--------------------------------------------------------------------------
    //
    // <span class="MuiSwitch-switchBase
    // MuiSwitch-colorPrimary Mui-checked MuiButtonBase-root
    // MuiSwitch-switchBase MuiSwitch-colorPrimary
    // Mui-checked PrivateSwitchBase-root
    // Mui-checked css-1i5zfsu-MuiButtonBase-root-MuiSwitch-switchBase" style="transform: translateX(10px);padding: 5px;"><input class="MuiSwitch-input PrivateSwitchBase-input css-1m9pwf3" type="checkbox" checked=""><span class="MuiSwitch-thumb css-jyxm41-MuiSwitch-thumb"></span></span>
    // const SuccessSlider = styled(Slider)(({ theme }) => ({
    //  width: 300,
    //  color: theme.palette.success.main,
    //  '& .MuiSlider-thumb': {
    //    '&:hover, &.Mui-focusVisible': {
    //      boxShadow: `0px 0px 0px 8px ${alpha(theme.palette.success.main, 0.16)}`,
    //    },
    //    '&.Mui-active': {
    //      boxShadow: `0px 0px 0px 14px ${alpha(theme.palette.success.main, 0.16)}`,
    //    },
    //  },
    // } ));   //
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: '30px',
          height: '20px',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        switchBase: (/* theme */) => ({
          padding: '5px',
          left: '0px',
          '&.Mui-checked': {
            transform: 'translateX(10px)',
          },
        }),
        // unchecked
        track: {
          width: '20px',
          height: '8px',
          borderRadius: '4px',
        },
        // unchecked
        thumb: {
          width: '10px',
          height: '10px',
          position: 'relative',
          transform: 'translateX(0px)',
        },
      },
    },
    //--------------------------------------------------------------------------
    /* Stepper */
    //--------------------------------------------------------------------------
    MuiStepper: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Luci-Stepper.root': {
            paddingTop: theme.spacing(4),
            paddingBottom: theme.spacing(4),
          },
        }),
      },
    },
    //--------------------------------------------------------------------------
    /* FormControl */
    //--------------------------------------------------------------------------
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          '&.Luci-Switch': {
            whiteSpace: 'nowrap',
            '& span input': {
              left: '-50%',
              width: '250%',
            },
            '&.smallFont': {
              "& span[class^='MuiTypography']": {
                fontSize: '0.65rem',
                marginBottom: '-2px',
              },
              '&.startPlacement': {
                "& span[class^='MuiTypography']": {
                  marginBottom: '2px',
                  marginRight: spacingFn(2),
                },
              },
              '&.endPlacement': {
                "& span[class^='MuiTypography']": {
                  marginBottom: '2px',
                  marginLeft: spacingFn(2),
                },
              },
            },
            '&.mediumFont': {
              "& span[class^='MuiTypography']": {
                fontSize: '0.8rem',
              },
              '&.startPlacement': {
                "& span[class^='MuiTypography']": {
                  marginBottom: '2px',
                  marginRight: spacingFn(3),
                },
              },
              '&.endPlacement': {
                "& span[class^='MuiTypography']": {
                  marginBottom: '2px',
                  marginLeft: spacingFn(3),
                },
              },
            },
            '&.largeFont': {
              '& > *': {
                fontSize: '0.9rem',
                marginRight: spacingFn(5),
              },
            },
          },
        },
      },
    },

    //--------------------------------------------------------------------------
    /* Divider */
    MuiDivider: {
      styleOverrides: {
        root: {
          width: '100%',
        },
      },
    },
    //--------------------------------------------------------------------------
    /* Container */
    MuiContainer: {
      styleOverrides: {
        maxWidthLg: {
          paddingLeft: '2px',
          paddingRight: '2px',
          paddingTop: '4px',
          paddingBottom: '6px',
        },
        root: ({ theme }) => ({
          backgroundColor: 'inherit',
          //---------------------------------------------------------------------
          // HeaderViews
          //---------------------------------------------------------------------
          '&.Luci-HeaderViews.root': {
            display: 'flex',
            flexDirection: 'column',
          },
          '&.Luci-HeaderViews.empty': {
            display: 'flex',
            justifyContent: 'center',
            marginTop: '38px',
            boxShadow: 'none',
          },
          //---------------------------------------------------------------------
          // Workbench
          // Parent to all: Luci-Workbench-board
          // Node-root
          //
          // ⚠️  avoid `& .child` (selection "all children")
          //
          // found in two contexts:
          // 👉 palette: superGroup
          // 👉 canvas: group/units
          //
          // 1/2 major style sections
          // 👉 EtlUnitBase, EtlUnitGroupBase; extends MuiCard
          // 👉 Node-root for superGroup, group and unit; extends MuiContainer
          //
          //---------------------------------------------------------------------

          '&.Luci-Workbench-board': {
            // debug
            // backgroundColor: 'blue',
            position: 'relative', // 🦀 ?
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            padding: '0',
            margin: '0',
            // --
            // clear spacing between Nodes
            '& .Node-root': {
              padding: 0,
            },
            '& .Node-root.group': {
              position: 'relative',
              '& > .fab': {
                bottom: `${spacing[3] / 2 - 3}px`,
                right: '10px',
                position: 'absolute',
              },
              '& > .spacer': {
                position: 'relative',
                height: theme.spacingFn(3),
              },
            },
            // divider between palette and canvas
            // ⚠️  Width must be specified
            '& > .workbench-split': {
              margin: `0 ${theme.spacing(0)}`,
              width: 0,
            },
            // ✅ Top & bottom margins must be the same
            // see: https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/api/draggable.md#unsupported-margin-setups
            '& .dragger': {
              backgroundColor: 'transparent',
              height: 'min-content',
              padding: '0',
              margin: '0',
            },
            // dnd - only when dragging
            '& .dragging': {
              padding: '0px',
            },
            // dnd - only when dragging over a dropzone
            '& .activeZone': {
              backgroundColor: palette.primary.light,
            },
            // --
            '& > .palette-root': {
              // debug
              // backgroundColor: 'yellow',
              height: '100%',
              minWidth: '160px',
              maxWidth: '20%',
              padding: theme.spacingFn(2),
              '& > .Node-root.superGroup': {
                display: 'flex',
                flexDirection: 'column',
                gap: `${theme.spacingFn(2)}`,
                // debug
                // backgroundColor: 'green',
                margin: 0,
                borderRadius: 0,
                height: '100%',
                '& > .Node-inner.superGroup': {
                  borderRadius: 0,
                  // debug
                  // backgroundColor: 'red',
                  height: '100%',
                  margin: 0,
                  padding: 0,
                  '& > .dropZone': {
                    display: 'flex',
                    flexDirection: 'row',
                    alignContent: 'flex-start',
                    flexWrap: 'wrap', // prefer single column
                    gap: `${theme.spacingFn(3)}`,
                    overflow: 'auto',
                    margin: 0,
                    padding: 0,
                    // debug
                    // backgroundColor: 'purple',
                    height: '100%',
                  },
                },
              },
            },
            // Has 3 superGroups
            '& > .canvas-root': {
              // debug
              // backgroundColor: 'cyan',
              minWidth: '50%',
              maxWidth: '75%',
              height: '100%',
              display: 'flex',
              flexDirection: 'row',
              // space between superGroups
              gap: `${theme.spacingFn(5)}`,
              // ⚠️  Can overlap with palette
              justifyContent: 'space-between',
              // hosts dropZone
              '& > .Node-root.superGroup': {
                padding: 0,
                borderRadius: 0,
                minWidth: SUPER_GROUP_MIN_WIDTH,
                // debug
                // backgroundColor: 'green',
                // padding: '4px',
                '& > .top-bar': {
                  minWidth: '40px',
                  maxWidth: '140px',
                  // align 'center'
                  // margin helps with dnd
                  margin: `${theme.spacingFn(4)} auto`,
                  height: '2px',
                  backgroundColor: palette.primary.light,
                  borderRadius: '3px',
                  border: 'none',
                },
                '& > .Node-inner.superGroup': {
                  // debug
                  // backgroundColor: 'cyan',
                  borderRadius: 0,
                  height: '100%',
                  '& > .dropZone.superGroup': {
                    // hosts EtlUnitGroupBase
                    borderRadius: GROUP_BORDER_RADIUS,
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap', // prefer single column
                    alignContent: 'flex-start',
                    gap: `${theme.spacingFn(3)}`,
                    overflow: 'auto',
                    // debug
                    // backgroundColor: 'purple',
                    // borderRadius: 0,
                    // ✅ avoid zero height for dropZone
                    height: '100%',
                  },
                },
              },
            },
          },
          //---------------------------------------------------------------------
          // CoreAppLayout
          //---------------------------------------------------------------------
          '&.Luci-CoreAppLayout.root': {
            padding: '0px',
            margin: '0px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            overflow: 'hidden',
            '& .app-paging-view': {
              overflow: 'hidden',
              display: 'flex',
              flexGrow: 1,
            },
            '& .app-paging-controller': {},
            '& .Luci-App-Footer': {},
          },
          '&.Luci-Float.workbench': {
            backgroundColor: theme.palette.secondary.light,
            border: 'none',
            borderRadius: 7,
            position: 'fixed',
            right: '3.5%',
            top: '55%',
            padding: 5,
            width: 'min-content',
            zIndex: 99,
            '& .MuiButton-root': {
              lineHeight: '1.2rem',
            },
          },
        }),
      },
    },
    //--------------------------------------------------------------------------
    // Paper
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: 'none',
          '&.Luci-Search-Bar': {
            '&.root': {
              height: spacingFn(6),
              display: 'flex',
              justifyContent: 'space-between',
              marginLeft: spacingFn(3),
            },
            // where the text renders
            '& .searchContainer': {
              margin: `auto`,
              marginLeft: spacingFn(4),
              marginRight: spacingFn(2),
              width: `calc(100% - ${theme.spacing(4)})`, // 6 button + 4 margin
              backgroundColor: alpha(theme.palette.common.white, 0.15),
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.25),
              },
            },
            '& .iconButton': {
              width: '30px',
              height: '30px',
              '& .MuiTouchRipple-root': {
                width: '30px',
                height: '30px',
              },
              color: theme.palette.action.active,
              transform: 'scale(1, 1)',
              transition: theme.transitions.create(['transform', 'color'], {
                duration: theme.transitions.duration.shorter,
                easing: theme.transitions.easing.easeInOut,
              }),
            },
            '& .iconButtonHidden': {
              transform: 'scale(0, 0)',
              // fix Warning CSS rule
              // '& > $icon': {
              // opacity: 0,
              // },
            },
            '& .searchIconButton': {
              marginRight: theme.spacing(-4),
            },
            '& .icon': {
              transition: theme.transitions.create(['opacity'], {
                duration: theme.transitions.duration.shorter,
                easing: theme.transitions.easing.easeInOut,
              }),
            },
            '& .input': {
              width: '100%',
            },
            '&.directory': {
              boxShadow: 'none',
              height: '30px',
              borderRadius: '3px',
              fontSize: '0.85em',
              position: 'relative',
              width: '100%',
              '& .MuiButtonBase-root': {
                padding: spacingFn(1),
                fontSize: '1.0rem',
              },
            },
          },
        }),
      },
    },
    //--------------------------------------------------------------------------
    // Avatar
    MuiListItemAvatar: {
      styleOverrides: {
        root: {
          minWidth: '15px',
        },
      },
    },
    // ------------------------------------------------------------------------------
    // SpanInput Icon and Avatar
    // ------------------------------------------------------------------------------
    MuiSvgIcon: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Luci-Icon': {
            width: '40px',
            height: '40px',
            position: 'relative',
            top: '7px',
            marginRight: '10px',

            '&.sourceDragIcon': {
              width: '30px',
              height: '20px',
              paddingBottom: '3px',
            },

            '&.header': {
              width: '20px',
              height: '20px',
              display: 'block',
              marginBottom: '5px',
              marginLeft: 'auto',
              marginRight: 'auto',
              '&.interval': {
                width: '30px',
                height: '30px',
                bottom: '2px',
                marginBottom: '-3px',
              },
            },
            '&.small': {
              width: '25px',
              height: '25px',
              top: '0px',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: '-7px',
              '&.mspan': {
                marginBottom: '-5px',
              },
            },
          },

          '&.EtlUnit-CardHeader-SvgIcon': {
            fontSize: 'inherit',
          },
          '&.EtlUnit-Search-SvgIcon': {
            fontSize: 'inherit',
            color: theme.palette.primary.contrastText,
          },
          '&.MuiSvgIcon-span-01': {
            width: '1.1em',
            height: '1.1em',
            marginRight: `${theme.spacingFn(2)}`,
            color: theme.palette.secondary.main,
          },
          '&.MuiSvgIcon-span-02': {
            width: '0.9em',
            height: '0.9em',
            marginRight: `${theme.spacingFn(1)}`,
            color: theme.palette.secondary.main,
          },
          '&.MuiSvgIcon-span-01-disabled': {
            color: theme.palette.grey['400'],
          },
          '&.MuiSvgIcon-span-02-disabled': {
            color: theme.palette.grey['400'],
          },
        }),
      },
    },
    //--------------------------------------------------------------------------
    /* Collapse */
    MuiCollapse: {
      styleOverrides: {
        root: {
          // 🦀? was container
          '&.EtlUnit-ValueGrid-Collapse': {
            marginTop: `0px`,
            marginBottom: `0px`,
            marginLeft: `${spacingFn(3)}`,
            marginRight: `${spacingFn(4)}`,
            padding: `${spacingFn(3)} 0px`,
          },
        },
      },
    },
    //--------------------------------------------------------------------------
    /* CardHeader */
    MuiCardHeader: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingTop: '8px',
          paddingBottom: '4px',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          margin: 'inherit',
          padding: 'inherit',
          '&.EtlUnit-Parameter': {
            padding: '0px',
            margin: `${theme.spacingFn(2)} 0px`,
            border: `0.5px ridge ${theme.palette.grey[200]}`,
            borderRadius: '4px',
            '&.no-border, &.quality': {
              border: `none`,
            },
          },
          '&.Luci-DirectoryView': {
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            flex: 1,
            overflow: 'inherit',
            marginRight: theme.spacingFn(3), // ⬜ match parent that set left
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          //---------------------------------------------------------------------
          // EtlFieldView
          // 🔖 copy/paste with '&.Luci-HeaderView'
          //---------------------------------------------------------------------
          '&.Luci-EtlFieldView': {
            marginTop: theme.spacingFn(3),
            marginLeft: theme.spacingFn(5),
            marginRight: theme.spacingFn(5),
            marginBottom: theme.spacingFn(3),
            paddingTop: theme.spacingFn(3),
            paddingBottom: theme.spacingFn(5),
            paddingLeft: theme.spacingFn(3),
            paddingRight: theme.spacingFn(3),
            boxShadow: theme.shadows[1],
            flexGrow: 0,
            '&.detailView': {
              boxShadow: 'none',
            },
            '& .title-input': {
              fontSize: '1.3rem',
              borderTopLeftRadius: '6px',
              borderTopRightRadius: '6px',
              backgroundColor: theme.palette.primary.superLight,
              paddingLeft: theme.spacing(5),
              paddingTop: theme.spacing(3),
            },
          },
          //---------------------------------------------------------------------
          // FileDialog left side
          //---------------------------------------------------------------------
          '&.Luci-DirectoryView': {
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            flex: 1,
            overflow: 'inherit',
            margin: `0 ${theme.spacingFn(3)}`,
            boxShadow: 'none',
            borderRadius: 0,
            backgroundColor: 'inherit',
            fontSize: '1.0rem',
            height: '100%',
            '& .grow-max': {
              display: 'flex',
              flexDirection: 'column',
              flexWrap: 'nowrap',
              overflow: 'inherit',
              flexGrow: 1,
            },
            '& .drive-providers': {
              marginBottom: theme.spacingFn(4),
              justifyContent: 'center',
            },
          },
          //---------------------------------------------------------------------
          // FileDialog right side
          //---------------------------------------------------------------------
          '&.Luci-HeaderViews': {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            marginLeft: theme.spacingFn(3),
            marginRight: theme.spacingFn(3),
            boxShadow: 'none',
            borderRadius: 0,
            // overflowBehavior: 'contain',
            minHeight: 'min-content',
            backgroundColor: 'inherit',
          },
          '&.Luci-HeaderView': {
            marginTop: theme.spacingFn(3),
            marginLeft: theme.spacingFn(0),
            marginRight: theme.spacingFn(0),
            marginBottom: theme.spacingFn(3),
            paddingTop: theme.spacingFn(3),
            paddingBottom: theme.spacingFn(5),
            paddingLeft: theme.spacingFn(5),
            paddingRight: theme.spacingFn(5),
            boxShadow: theme.shadows[1],
            '& .detail': {
              borderRadius: 0,
              boxShadow: 'none',
              marginTop: theme.spacingFn(3),
            },
            '& .summary': {},
          },
          //---------------------------------------------------------------------
          // EtlUnitBase & GroupBase (Card)
          //
          // found in two contexts:
          // 👉 palette: superGroup
          // 👉 canvas: group/units
          //
          // 1/2 major style sections
          // 👉 EtlUnitBase, EtlUnitGroupBase; extends MuiCard
          // 👉 Node-root for superGroup, group and unit; extends MuiContainer
          //---------------------------------------------------------------------
          '&.EtlUnitBase-root': {
            borderRadius: '4px',
            border: `1px solid ${theme.palette.primary.light}`,
            boxShadow: 'none',
            backgroundColor: theme.palette.grey[50],
            display: 'block',
            '&.canvas': {
              margin: '0',
              maxWidth: '100%',
            },
            '& > hr': {
              display: 'none',
              border: 'none',
            },
            '& > hr.top-bar': {
              display: 'block',
              height: '5px',
              backgroundColor: palette.primary.main,
            },
            '& > hr.foot-bar': {
              display: 'block',
              height: '7px',
              backgroundColor: palette.primary.superLight,
            },
          },

          '&.EtlUnitBase-root.canvas': {
            '&.EtlUnit-CardContent': {
              border: 'none',
              padding: '0px',
              margin: '0px',
              '&.quality': {
                // padding
                paddingTop: spacingFn(2),
                paddingRight: spacingFn(5),
                paddingBottom: spacingFn(3),
                paddingLeft: spacingFn(3),
                // margins
                marginTop: spacingFn(3),
                marginLeft: spacingFn(4),
                marginRight: spacingFn(4),
              },
            },
          },
          '&.EtlUnitGroupBase-root': {
            margin: 0,
            padding: 0,
            borderRadius: GROUP_BORDER_RADIUS,
            border: `1px solid ${theme.palette.primary.main}`,
            '& .units > .dropZone': {
              display: 'flex',
              flexWrap: 'wrap', // prefer single column
              flexDirection: 'row',
              justifyContent: 'center',
              gap: `${spacingFn(3)}`,
              // debug
              // backgroundColor: 'red',
              // ✅ avoid zero height for dropZone
              //    Accomplished here because an empty group
              //    does not exist in the data structure
            },
            '& > .header-wrapper': {
              '& > .shell': { display: 'none' },
              '& > .header': {
                padding: theme.spacingFn(3),
                textAlign: 'center',
                color: theme.palette.text.secondary,
                backgroundColor: theme.palette.primary.superLight,
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: theme.spacingFn(1),
                paddingBottom: theme.spacingFn(1),
                paddingRight: theme.spacingFn(3),
                paddingLeft: theme.spacingFn(3),
                '& > .title': {
                  display: 'flex',
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  '& > .icon': {
                    marginRight: theme.spacingFn(4),
                    marginLeft: theme.spacingFn(3),
                    color: theme.palette.secondary.main,
                  },
                  '& > .text': {
                    fontSize: '0.8rem',
                    lineHeight: '0.9rem',
                    color: theme.palette.grey[800],
                  },
                },
              },
            },
            '& > .footer-wrapper': {
              '& > .shell': { display: 'none' },
              '& > .footer': {
                backgroundColor: theme.palette.primary.superLight,
                height: theme.spacingFn(4),
              },
            },
          },
          '& .semantic': {
            padding: theme.spacingFn(3),
            textAlign: 'center',
            color: theme.palette.text.secondary,
          },
          //---------------------------------------------------------------------
          // SpanInput Card
          //---------------------------------------------------------------------
          '&.MuiSpanInput--01': {
            borderRadius: 6,
            margin: theme.spacing[2],
            marginBottom: theme.spacing[3],
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minWidth: '200px',
            maxWidth: '400px',
            maxHeight: '40px',
            paddingTop: theme.spacing[3],
            paddingRight: theme.spacing[3],
            paddingBottom: theme.spacing[4],
            paddingLeft: theme.spacing[3],
            backgroundColor: theme.palette.primary.superLight,
            // form control
            '&.list': {
              backgroundColor: 'transparent',
              boxShadow: 'none',
              paddingTop: theme.spacing[0],
              paddingBottom: theme.spacing[2],
              paddingLeft: theme.spacing[2],
            },

            // form control
            '& .MuiFormControl-root': {
              fontSize: '0.7rem',
            },
            // switch series label
            '& .MuiFormControlLabel-root': {
              margin: theme.spacing[0],
            },
            '& .MuiInputLabel-root': {
              fontSize: '0.75rem',
              marginTop: theme.spacing[0],
              marginBottom: theme.spacing[0],
            },
            '& .MuiInput-formControl': {
              marginTop: theme.spacing[3],
              marginBottom: theme.spacing[0],
            },
            // input
            '& .MuiInputBase-root': {
              fontSize: 'inherit',
            },
            '& .MuiInputBase-input': {
              paddingTop: theme.spacing[3],
              paddingBottom: theme.spacing[2],
            },
            // typography for switch
            '& .MuiTypography-body1': {
              fontSize: '0.6rem',
            },
            // divider
            '& .MuiDivider-root': {
              margin: `${theme.spacing(0)} 0`,
            },
          },
        }),
      },
    },
    //--------------------------------------------------------------------------
    // Typography
    //--------------------------------------------------------------------------
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.MuiSmallTag--01': {
            fontSize: '0.8em',
            marginTop: '-6px',
          },
          '&.MuiSmallTag--02': {
            fontSize: '0.8em',
            marginBottom: '-8px',
          },
          '&.MuiSmallTag--03': {
            fontSize: '0.9em',
            margin: `${muiBaseTheme.spacing(1)}`,
          },
          '&.MuiFieldLevel--01': {
            fontSize: '0.95em',
            margin: `${muiBaseTheme.spacing(0)}`,
          },
          // etlUnit search bar ?? WIP
          '&.AppBarSearchInput': {
            fontSize: '0.9rem',
            color: palette.primary.contrastText,
          },
          '&.Luci-error': {
            color: palette.error.main,
            fontFamily: 'Lato',
          },
          '&.Luci-warning': {
            color: palette.warning.main,
            fontFamily: 'Lato',
            fontStyle: 'Italic',
            fontSize: '0.95rem',
          },
        },
      },
    },
    //--------------------------------------------------------------------------
    // ButtonGroup
    // 🔖 dynamic sizing using viewport size (vw, vh or vmax, vmin)
    //--------------------------------------------------------------------------
    MuiButtonGroup: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Luci-ButtonGroup-purpose': {
            justifyContent: 'center',
            '& > button': {
              display: 'inline-block',
              fontSize: '1.4vw',
              fontFamily: 'Raleway',
              borderRadius: '50%',
              cursor: 'pointer',
              height: '2.0vw',
              width: '2.0vw',
              marginLeft: '1px',
              marginRight: '1px',
              padding: 0,
              backgroundColor: '#fff',
              color: '#666',
              transition: 'all 0.5s',
              border: '1px solid #999',
              '&.selected': {
                backgroundColor: '#999',
                color: '#fff',
              },
              '&.disabled': {
                opacity: '0.5',
              },
              '&:hover:not(.selected)': {
                position: 'sticky',
                backgroundColor: theme.palette.secondary.light,
                color: '#fff',
                fontWeight: '700',
                border: `1px solid ${theme.palette.secondary.light}`,
              },
              '&:hover': {
                color: theme.palette.secondary.light,
              },
            },
          },
        }),
      },
    },
    //--------------------------------------------------------------------------
    // Button
    //--------------------------------------------------------------------------
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '0',
          minWidth: '10px',
          textTransform: 'none',
        },
      },
    },
    //----------------------------------------------------------------------------
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Luci-ButtonBase': {
            '& button': {
              borderRadius: `3px`,
              marginTop: theme.spacingFn(1),
              marginLeft: theme.spacingFn(4),
              backgroundColor: theme.palette.grey[200],
              boxShadow:
                '0px 2px 1px -2px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
              "& span[class*='MuiButton-label']": {
                fontSize: '0.7rem',
                marginRight: theme.spacingFn(3),
                marginLeft: theme.spacingFn(4),
                color: theme.palette.grey[600],
                '& span': {
                  marginRight: theme.spacingFn(2),
                  "& svg[class*='MuiSvgIcon-root']": {
                    fontSize: '17px',
                  },
                },
              },
            },
          },
        }),
      },
    },
    //----------------------------------------------------------------------------
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Luci-IconButton': {
            padding: theme.spacingFn(2),
            margin: theme.spacingFn(1),
            '&.small': {
              fontSize: '1.0rem',
              '& svg': {
                width: '0.8em',
                height: '0.8em',
              },
            },
            '&:hover': {
              color: theme.palette.primary.main,
            },
          },
          '&.weight': {
            transform: 'rotate(90deg)',
          },
          '&.addMeaImpliedFieldButton': {
            // marginLeft: 'auto',
            color: theme.palette.primary.main,
            marginTop: '2px',
            marginRight: 'auto',
          },
          '&.addQualImpliedFieldButton': {
            padding: '0px',
            marginLeft: '12px',
            color: theme.palette.primary.main,
          },
        }),
      },
    },
    /* FilledInput */
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderRadius: '6px 6px 0px 0px',
        },
      },
    },
  },
  props: {
    // Name of the component
    /* eslint-disable react/jsx-filename-extension */
  },
});
