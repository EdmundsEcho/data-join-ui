/**
 * @module components/Theme
 *
 * @description
 * Injects a theme
 *
 * The overrides and palette are the workhorses for the module.
 *
 */
import { alpha, createTheme, darken, lighten } from '@mui/material/styles';

import paletteLight from './assets/scheme/palette.v2.json';
import paletteDarkOverrides from './assets/scheme/palette-dark.json';

// used to create a customer version starting with mui's default
import { FIELD_TYPES, PURPOSE_TYPES } from './lib/sum-types';

/**
 * Custom theme that is supposed to overwrite the default theme
 * where the props overlap.
 *
 * 🔖 theme and owner state are part of the context. Example:
 *    const { absolute, children, classes,
 *            flexItem, light, orientation, textAlign, variant
 *    } = ownerState;
 *
 *    Colors that depend on theme mode
 *    - mui primary, secondary, error, warning, info, success
 *    - palette.themeColors
 */

const spacing = [0, 2, 4, 6, 10, 14, 20, 26, 32, 38, 48, 58, 64];
/**
 * Computes a size value with px appended.
 * @function
 * @param {Number} sizeIndex
 * @return {String} size with px
 */
const spacingFn = (value) => `${spacing[value]}px`;

// 🔖 Workbench
// min set by etlUnit time parameter
const SUPER_GROUP_MIN_WIDTH = '257px';
const GROUP_BORDER_RADIUS = spacingFn(3);

const paletteDark = {
  ...paletteLight,
  ...paletteDarkOverrides,
};

export default (mode) => {
  const isLightMode = mode === 'light';
  const palette = isLightMode ? paletteLight : paletteDark;

  // start temp
  const getBackgroundColor = (color) =>
    mode === 'dark' ? darken(color, 0.7) : lighten(color, 0.7);

  const getHoverBackgroundColor = (color) =>
    mode === 'dark' ? darken(color, 0.6) : lighten(color, 0.6);

  const getSelectedBackgroundColor = (color) =>
    mode === 'dark' ? darken(color, 0.5) : lighten(color, 0.5);

  const getSelectedHoverBackgroundColor = (color) =>
    mode === 'dark' ? darken(color, 0.4) : lighten(color, 0.4);

  // end temp

  return createTheme({
    spacing,
    spacingFn,

    palette: {
      ...palette,
      useNextVariants: true,
      mode,
    },
    typography: {
      htmlFontSize: 14,
      fontSize: 14,
      // rem font-size set in index.css
      fontFamily: ['Rubik', 'Lato', 'Raleway', 'Helvetica', 'Arial', 'sans-serif'].join(
        ',',
      ),

      h1: {
        fontSize: '5rem',
        fontFamily: 'Rubik',
      },
      h2: {
        fontSize: '3.15rem',
        fontFamily: 'Rubik',
      },
      h3: {
        fontSize: '2.5rem',
        fontFamily: 'Rubik',
      },
      h4: {
        fontSize: '1.785rem',
        fontFamily: 'Rubik',
      },
      h5: {
        fontSize: '1.25rem',
        fontFamily: 'Rubik',
      },
      h6: {
        fontSize: '1.05rem',
        fontFamily: 'Rubik',
      },
      subtitle1: {
        fontFamily: 'Lato',
      },
      subtitle2: {
        fontFamily: 'Lato',
      },
      body1: {
        fontFamily: 'Lato',
        fontSize: '1rem',
        fontWeight: '400',
        lineHeight: 1.5,
        color: isLightMode ? palette.grey[700] : palette.text.secondary,
      },
      body2: {
        fontFamily: 'Lato',
        fontSize: '0.9rem',
        fontWeight: '400',
        lineHeight: 1.43,
        color: isLightMode ? palette.grey[800] : palette.text.secondary,
      },
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

    components: {
      //--------------------------------------------------------------------------
      MuiCssBaseline: {},
      //--------------------------------------------------------------------------
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            height: 'var(--app-bar-height)',
            backgroundColor: theme.palette.primary.main,
          }),
        },
      },
      //--------------------------------------------------------------------------
      //--------------------------------------------------------------------------
      /* Table */
      /* Note: can also pass { theme, ownerState } */
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
              paddingTop: theme.spacingFn(8),
              paddingBottom: theme.spacingFn(3),
              backgroundColor: isLightMode
                ? theme.palette.grey[200]
                : theme.palette.grey[800],
            },
            '& thead tr th:first-of-type svg': {
              marginBottom: '-4px',
            },
            // last cell: more space on the right
            '& thead tr th:last-child': {
              paddingRight: theme.spacingFn(5),
              borderTopRightRadius: '0.5rem',
            },
            '& tbody tr td:last-child': {
              paddingRight: theme.spacingFn(5),
            },
            '& tbody tr:last-child td': {
              border: 'none',
            },
            // header rounding
            '& thead tr th:first-of-type': {
              borderTopLeftRadius: '0.5rem',
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
              // SymbolMapMaker
              //--------------------------------------------------------------------
              '&.symbolMapMaker': {
                '& th': {
                  whiteSpace: 'nowrap',
                },
                '& th:last-child, & td:last-child': {
                  paddingRight: 'unset',
                },
                '& > tbody > tr.Luci-SymbolMapItem > td': {
                  border: 'none',
                  paddingTop: '0',
                  paddingBottom: '0',
                },
                '& > thead > tr > th:first-of-type, & > tbody > tr > td:first-of-type, & > tfoot > tr > td:first-of-type':
                  {
                    paddingLeft: '1.0em',
                  },
                '& > thead > tr > th': {
                  paddingTop: '0.5em',
                  paddingBottom: '0.1em',
                },
                '& th > p': {
                  textAlign: 'left',
                },
              },
              '& .symbolMapMaker.footer-cell': {
                borderBottom: 'none',
              },
              '& .Luci-AutocompleteNewPair td': {
                paddingTop: '1.5em',
                borderBottom: 'none',
                paddingLeft: '0.5em',
              },
              '& .Luci-SymbolMapItem': {
                '& .MuiInputBase-input': {
                  height: '20px',
                },
                '& .MuiSvgIcon-root': {
                  color: theme.palette.themeColors['color-icon'],
                },
              },
              //--------------------------------------------------------------------
              // HeaderView fields
              //--------------------------------------------------------------------
              '&.headerView': {
                tableLayout: 'fixed',
                '& thead tr th[class*=excludeCell]': { width: '40px' },
                '& thead tr th[class*=fieldnameCell]': { width: '25%' },
                '& thead tr th[class*=aliasCell]': { width: '20%' },
                '& thead tr th[class*=purposeCell]': { width: '25%' },
                '& thead tr th[class*=levelsCell]': { width: '10%' },
                '& thead tr th[class*=nullsCell]': { width: '10%' },
                '& thead tr th[class*=toggleDetailCell]': { width: '40px' },
              },
              '&.headerView td > .Luci-field.fieldname > p': {
                textAlign: 'left',
                fontSize: '0.9vw',
              },
              '&.headerView, &.factorNames': {
                '& .MuiTableCell-head': {},
              },
              //--------------------------------------------------------------------
              // Etl fields
              //--------------------------------------------------------------------
              '&.etlFields, &.etlUnitMeas': {
                '& .MuiTableCell-head': {
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
                  backgroundColor: isLightMode
                    ? theme.palette.primary.superLight
                    : theme.palette.primary.dark,
                  filter: isLightMode ? 'none' : 'brightness(0.8)',
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
              },
            },
            //--------------------------------------------------------------------
            // Group-by-file etlField
            '&.Luci-Table.group-by-file.dialog': {
              '& .cell': {
                borderBottom: '0px',
              },
            },
            '&.Luci-Table.group-by-file.dialog.error': {},
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
              "& thead tr th[class*='filename'], & tbody tr td[class*='filename']": {
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
      // outlined input
      MuiOutlinedInput: {
        styleOverrides: {
          root: (/* { theme } */) => ({
            borderRadius: '0.5em',
          }),
        },
      },
      MuiFormControl: {
        defaultProps: {
          variant: 'standard',
        },
        styleOverrides: {
          root: ({ theme }) => ({
            '&.Luci-SelectMenu': {
              minWidth: '36px',
              '&.derivedField': {
                minWidth: '80px',
              },
              '& > label': {
                marginTop: spacingFn(3),
              },
              '& > .MuiInput-root > .MuiSelect-select:focus': {
                backgroundColor: 'inherit',
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
              '& .input': {
                padding: '6px 0px 4px',
                fontFamily: 'Lato',
                fontSize: '0.8rem',
                color: theme.palette.primary.main,
              },
              // sibling; helper text
              '& + p': {
                fontFamily: 'Lato',
                fontSize: '0.7rem',
                lineHeight: '0.7rem',
                color: theme.palette.primary.main,
              },
              // WIP - can't find the lavel in html
              /* '& .componentsInputLabel': {
                fontFamily: 'Lato',
                fontSize: '0.6rem',
                lineHeight: '0.6rem',
                color: theme.palette.primary.main,
              }, */
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
      // rowClassName || `Luci-DataGrid-Row--${params.row.status}`
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
            '& .Luci-DataGrid-workbench--header': {},
            '& .Luci-DataGrid-workbench--level': {
              // backgroundColor: getBackgroundColor(theme.palette.grey[100]),
              '&.hover': {
                // backgroundColor: getHoverBackgroundColor(theme.palette.grey[100]),
              },
            },
            '&.Luci-DataGrid-matrix': {},
          }),
          columnHeaders: ({ theme }) => ({
            backgroundColor: isLightMode
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
            borderTopLeftRadius: '0.5em',
            borderTopRightRadius: '0.5em',
          }),
          columnHeader: ({ theme }) => ({
            height: 'calc(1.3em * 5)',
            lineHeight: '1.3em',
            padding: '0.7em 0.5em',
            paddingTop: '1.0em',
            border: 'none',
            outline: 'none',
            outlineColor: 'transparent',
            '&:focus': {
              outline: 'none',
            },
            '&:focus-within': {
              outline: 'none',
            },
          }),
          columnHeaderTitleContainer: () => ({
            // a flex box
            alignItems: 'flex-end',
          }),
          columnHeaderTitle: () => ({
            height: 'max-content',
            fontSize: '0.9em',
            lineHeight: '1.1em',
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
            wordWrap: 'break-word',
            wordBreak: 'break-word',
            hyphens: 'auto',
          }),
          columnSeparator: () => ({
            '& > svg': {
              marginTop: 'auto',
            },
          }),
          cell: () => ({
            padding: `0 ${spacingFn(4)}`,
            border: 'none',
            '&:focus': {
              outline: 'none',
            },
            '&:focus-within': {
              outline: 'none',
            },
          }),
          columnHeaderCheckbox: ({ theme }) => ({
            padding: spacingFn(1),
            '& svg': {
              height: '1.2rem',
              width: '1.2rem',
              fontSize: '1.2rem',
            },
            '& svg.selected': {
              color: theme.palette.primary.main,
            },
            '& svg.deselected': {
              color: theme.palette.grey[500],
            },
          }),
          cellCheckbox: ({ theme }) => ({
            border: 'none',
            '&:hover': { backgroundColor: 'transparent' },
            '&:focus': {
              outline: 'none',
            },
            '&:focus-within': {
              outline: 'none',
            },
            padding: '0',
            '& > svg': {
              height: '1.0rem',
              width: '1.0rem',
              fontSize: '1.0rem',
            },
            '& svg.selected': {
              color: theme.palette.primary.main,
            },
            '& svg.deselected': {
              color: theme.palette.grey[500],
            },
          }),
          row: ({ theme }) => ({
            '&:hover': {
              backgroundColor: isLightMode
                ? theme.palette.primary.superLight
                : theme.palette.grey[800],
            },
            '&.Mui-selected': {
              opacity: 0.5,
              backgroundColor: isLightMode
                ? theme.palette.grey[100]
                : theme.palette.grey[600],
              '&:hover': {
                opacity: 1,
                backgroundColor: isLightMode
                  ? theme.palette.primary.superLight
                  : theme.palette.grey[800],
              },
            },
          }),
          panelWrapper: ({ theme }) => ({
            padding: '0.4em',
            backgroundColor: isLightMode
              ? theme.palette.grey[300]
              : theme.palette.grey[900],
            borderRadius: '0.4em',
          }),
          panelFooter: ({ theme }) => ({
            marginTop: '0.5em',
          }),
          filterForm: ({ theme }) => ({
            '& > div > button': {
              marginBottom: 'auto',
              // move the buttom up and to the left by 5px
              transform: 'translate(-5px, -5px)',
              color: isLightMode ? theme.palette.grey[400] : theme.palette.grey[700],
              width: '24px',
              height: '24px',
              '&:hover': {
                backgroundColor: 'transparent',
              },
            },
          }),
        },
      },
      MuiTooltip: {
        styleOverrides: {
          popper: {
            borderRadius: '0.5em',
          },
        },
      },
      //--------------------------------------------------------------------------
      /* Toolbar
       * Coordinate with AppBar
       */
      MuiToolbar: {
        styleOverrides: {
          dense: {
            '&.Luci-DirectoryView': {
              minHeight: 'min-content',
            },
          },
          root: ({ theme }) => ({
            '&.Luci-Toolbar': {
              minHeight: 'unset',
            },
            '&.Luci-Toolbar.app-bar': {
              marginTop: 'auto',
              marginBottom: 'auto',
            },
            '&.Luci-Toolbar.side-nav': {
              height: 'var(--app-bar-height)',
              backgroundColor: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            },
            '& .MuiSvgIcon-root': {
              color: theme.palette.primary.contrastText,
            },
            '&.Luci-DirectoryView': {
              width: '100%',
            },
            '&.Luci-Toolbar.Drive-Providers': {
              '& .MuiSvgIcon-root': {
                color: theme.palette.primary.contrastText,
              },
            },
          }),
        },
      },
      //--------------------------------------------------------------------------
      /* Grid */
      MuiGrid: {
        styleOverrides: {
          root: ({ theme }) => ({
            //------------------------------------------------------------------
            // mspan chips
            //------------------------------------------------------------------
            '&.Luci-FileField-LevelSpans': {
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
            },
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
            // DataGrid-actions
            //----------------------------------------------------------------------
            [`&.${FIELD_TYPES.ETL}  .Luci-DataGrid-header`]: {
              marginTop: '-12px',
              marginBottom: '11px',
            },
            '&.Luci-DataGrid-actions': {
              display: 'flex',
              marginLeft: 'auto',
              marginRight: '1ch',
              [`&.${FIELD_TYPES.ETL}`]: {},
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
              '& .MuiGrid-item': {
                lineHeight: '80%',
              },
              '& .MuiTypography-root': {
                fontSize: '0.7rem',
                lineHeight: 'inherit',
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
            '&.Luci-Dialog.root': {},
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
      // const SuccessSlider = st(Slider)(({ theme }) => ({
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
          root: () => ({}),
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
            // Workbench
            //---------------------------------------------------------------------
            '&.Luci-Workbench-board > .palette-root': {
              padding: '2px !important',
              borderRadius: '0.4rem !important',
            },
            '&.Luci-Workbench-board > .palette-root > .Node-root.superGroup': {
              borderRadius: '0.4rem',
            },
            '&.Luci-Workbench-board .superGroup': {
              backgroundColor: theme.palette.themeColors['color-background-paper'],
            },
            '&.Luci-Workbench-board .superGroup.palette': {
              paddingTop: '1rem',
              borderRadius: '0.4rem',
            },
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
            // To start, the board is flex with 3 items, the second being a divider
            // 1. palette-root
            // 2. canvas-root
            //---------------------------------------------------------------------
            '&.Luci-Workbench-board': {
              position: 'relative', // 🦀 ?
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'stretch',
              gap: '0',
              padding: '0',
              margin: '0',
              // --
              // clear spacing between Nodes
              '& .Node-root': {
                padding: 0,
              },
              '& .canvas.superGroup, .palette.superGroup': {},
              '& .Node-root.group': {
                position: 'relative',
                '& > .fab': {
                  bottom: `${spacing[3] / 2 - 3}px`,
                  right: '10px',
                  position: 'absolute',
                  '&:hover': isLightMode
                    ? {
                        backgroundColor: theme.palette.secondary.extraLight,
                        color: theme.palette.primary.extraDark,
                      }
                    : {
                        backgroundColor: theme.palette.primary.main,
                      },
                },
                '& > .spacer': {
                  position: 'relative',
                  height: theme.spacingFn(3),
                },
              },
              // divider between palette and canvas
              // ⚠️  Width must be specified
              '& > .workbench-split': {
                margin: '0px',
                borderStyle: 'none', // hide it for now
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
                backgroundColor: theme.palette.primary.light,
              },
              // -- starting point for palette
              '& > .palette-root': {
                flex: '1 1 300px', // grow quickly to prefered size of 270px
                height: '100%',
                minWidth: '160px',
                maxWidth: '20%',
                padding: '0.5rem',
                marginTop: '0.5rem',
                marginRight: '0',
                marginLeft: '0',
                borderRadius: '0.5em',
                backgroundColor: isLightMode
                  ? 'rgba(0,0,0,0.1)' // darker
                  : 'rgba(255,255,255, 0.05)', // brighter
                '& > .Node-root.superGroup': {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  // debug
                  // backgroundColor: 'green',
                  margin: 0,
                  borderRadius: 0,
                  height: '100%',
                  '& > p': {
                    margin: 'auto',
                  },
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
                      gap: '0.5rem',
                      overflow: 'auto',
                      paddingRight: '10px', // push the scrollbar
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
                flex: '1 1 auto',
                minWidth: '50%',
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
                    backgroundColor: theme.palette.primary.extraLight,
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
            // ErrorBoundary
            //---------------------------------------------------------------------
            '&.Luci-error-boundary': {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              border: `solid 0.5px ${theme.palette.grey[300]}`,
              padding: spacingFn(6),
              borderRadius: spacingFn(3),
              gap: spacingFn(6),
              '& > h1, h2, h3': {
                color: theme.palette.error.main,
              },
              '& .error': {
                marginTop: spacingFn(7),
                marginBottom: spacingFn(7),
              },
              '& .componentStack': {
                margin: spacingFn(0),
                maxHeight: '60vh',
                overflowY: 'scroll',
              },
              '& button': {
                width: 'fit-content',
                padding: `${spacingFn(3)} ${spacingFn(6)}`,
                marginTop: spacingFn(7),
                borderRadius: spacingFn(3),
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
            backgroundColor: isLightMode ? theme.palette.light : theme.palette.dark,
            backgroundImage: isLightMode
              ? `linear-gradient(
                    rgba(255, 255, 255, 0.05),
                    rgba(255, 255, 255, 0.05)
                )`
              : 'none',
            '&.Luci-Search-Bar': {
              '&.root': {
                height: spacingFn(6),
                display: 'flex',
                justifyContent: 'space-between',
                marginLeft: spacingFn(3),
                backgroundColor: 'inherit',
                borderRadius: '0.75rem',
              },
              // where the text renders
              '& .searchContainer': {
                margin: `0 auto`,
                marginLeft: spacingFn(2),
                width: `calc(100% - ${theme.spacing(4)})`, // 6 button + 4 margin
                backgroundColor: 'inherit',
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
            '&.Luci-AutocompleteNewPair.Luci-PopperPaper': {
              backgroundColor: theme.palette.themeColors['color-background-paper'],
              borderRadius: '0.2em',
              '& li': {
                color: theme.palette.text.primary,
              },
            },
          }),
        },
      },
      // Popover-paper
      MuiMenu: {
        styleOverrides: {
          root: () => ({
            '& .MuiMenu-paper': {
              borderRadius: '0.5rem',
              filter: isLightMode ? 'brightness(0.93)' : 'brightness(1.7)',
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
      //--------------------------------------------------------------------------
      // ListItems
      MuiList: {
        styleOverrides: {
          root: {
            '&.Luci-FileUploader': {
              width: '90%',
              '& .MuiListItemText-primary': {
                fontSize: '1.05rem',
              },
              '& .MuiListItemText-secondary': {
                fontSize: '0.85rem',
              },
            },
          },
        },
      },
      // ------------------------------------------------------------------------------
      // SpanInput Icon and Avatar
      // ------------------------------------------------------------------------------
      MuiSvgIcon: {
        styleOverrides: {
          root: ({ theme }) => ({
            '& text': {
              fill: theme.palette.primary.contrastText,
            },
            '&.provider-icon': {
              fill: theme.palette.text.bright,
            },
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
            '&.span-icon': {
              width: '0.9em',
              height: '0.9em',
              marginLeft: `${theme.spacingFn(1)}`,
              color: theme.palette.secondary.contrastText,
              '&.disabled': {
                color: theme.palette.grey['400'],
              },
            },
          }),
        },
      },
      //--------------------------------------------------------------------------
      /* Collapse */
      // see for options https://reactcommunity.org/react-transition-group/transition
      MuiCollapse: {
        defaultProps: {
          timeout: 'auto', // depends on height
          mountOnEnter: true, // lazy load
        },
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
            '&.Luci-Collapse-prerender': {
              overflow: 'hidden',
              '&.hidden': {
                visibility: 'hidden',
              },
            },
            /*
            entered: {
              transition: 'height 100ms linear', // Adjust the time here
            },
            container: {
              transition: 'height 100ms linear', // Adjust the time here
            },
            wrapper: {
              transition: 'height 100ms linear', // Adjust the time here
            }, */
          },
        },
      },
      //--------------------------------------------------------------------------
      /* MuiCard related */
      MuiCardHeader: {
        styleOverrides: {
          root: {
            paddingLeft: '16px',
            paddingRight: '16px',
            paddingTop: '8px',
            paddingBottom: '4px',
          },
          action: ({ theme }) => ({
            '& > .Luci-HeaderView-Actions > div .MuiSvgIcon-root': {
              color: theme.palette.themeColors['icon-color'],
            },
          }),
        },
      },
      //--------------------------------------------------------------------------
      MuiCardContent: {
        styleOverrides: {
          root: ({ theme }) => ({
            margin: 'inherit',
            padding: 'inherit',
            // workbench
            '&.EtlUnit-parameter, &.EtlUnit-measurement': {
              padding: '0px',
              margin: `${theme.spacingFn(2)} 0px`,
              // coordinate with MuiCardHeader EtlUnit-CardHeader
              border: isLightMode
                ? `0.5px solid ${theme.palette.grey[300]}`
                : `1.5px solid ${theme.palette.grey[700]}`,
              borderRadius: '5px',
              '&.no-border, &.quality': {
                border: `none`,
              },
            },
            '&.EtlUnit-parameter.quality, &.EtlUnit-measurement.measurement': {
              '& .EtlUnit-CardHeader.root': {
                gap: '0.5em',
              },
            },
            '&.Luci-DirectoryView': {
              display: 'flex',
              flexDirection: 'column',
              flexWrap: 'nowrap',
              flex: 1,
              overflow: 'inherit',
              marginRight: theme.spacingFn(3), // ⬜ match parent that set left
              // fontSize: '1.2vw', // ⬜ match parent that set left
              fontSize: '1.0rem', // ⬜ match parent that set left
            },
            '&.hidden': {
              visibility: 'hidden',
            },
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            '&.Luci-FileUploader': {
              backgroundColor: 'inherit',
            },
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
                paddingLeft: theme.spacing(5),
                paddingTop: theme.spacing(3),
                backgroundColor: isLightMode
                  ? theme.palette.primary.superLight
                  : theme.palette.primary.dark,
                filter: isLightMode ? 'none' : 'brightness(0.9)',
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
              fontSize: '0.9rem',
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
              paddingLeft: theme.spacingFn(7),
              paddingRight: theme.spacingFn(7),
              boxShadow: theme.shadows[1],
              '& .detail': {
                borderRadius: 0,
                boxShadow: 'none',
                marginTop: theme.spacingFn(3),
                padding: 0,
              },
              '& .summary': {
                padding: `${theme.spacingFn(3)} ${theme.spacingFn(4)}`,
              },
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
            // Node-root for superGroup, group and unit; extends MuiContainer
            //---------------------------------------------------------------------
            '&.EtlUnitBase-root': {
              borderRadius: '5px',
              border: isLightMode
                ? `1px solid ${theme.palette.primary.light}`
                : `1px solid ${theme.palette.primary.dark}`,
              boxShadow: 'none',
              backgroundColor: theme.palette.themeColors['color-background-title'],
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
            /* Group */
            '&.EtlUnitGroupBase-root': {
              margin: 0,
              padding: 0,
              borderRadius: GROUP_BORDER_RADIUS,
              backgroundColor: theme.palette.themeColors['color-background-heading'],
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
                  backgroundColor: theme.palette.themeColors['color-primary-dark'],
                  color: theme.palette.primary.contrastText,
                  filter: 'brightness(1.1)',
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
                      color: 'inherit',
                    },
                  },
                  '& button': {
                    color: 'inherit',
                  },
                },
              },
              '& .Luci-tools': {
                display: 'flex',
                flex: 0.3,
                alignItems: 'center',
                justifyContent: 'space-between',
                '&.v1': {
                  justifyContent: 'flex-end',
                },
                '& .tool': {
                  padding: 0,
                },
                '& .icon': {
                  margin: 0,
                  padding: 0,
                  fontSize: '1.3rem',
                  '&.clear': {
                    padding: theme.spacingFn(1),
                    fontSize: '1.2rem',
                  },
                  '&.menu': {
                    padding: theme.spacingFn(1),
                    fontSize: '1.2rem',
                  },
                  '&.expandMoreIcon': {
                    fontSize: '1.5rem',
                    padding: theme.spacingFn(1),
                  },
                },
                '& > .folding': {
                  display: 'flex',
                  justifyContent: 'flex-start',
                  width: '50px',
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
          }),
        },
      },
      //--------------------------------------------------------------------------
      // Typography
      //--------------------------------------------------------------------------
      MuiTypography: {
        styleOverrides: {
          root: ({ theme }) => ({
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
              margin: theme.spacing(1),
            },
            '&.MuiFieldLevel--01': {
              fontSize: '0.95em',
              margin: theme.spacing(0),
            },
            // etlUnit search bar ?? WIP
            '&.AppBarSearchInput': {
              fontSize: '0.9rem',
              color: theme.palette.primary.contrastText,
            },
            '&.Luci-error': {
              color: theme.palette.error.main,
              fontFamily: 'Lato',
            },
            '&.Luci-warning': {
              color: theme.palette.warning.main,
              fontFamily: 'Lato',
              fontStyle: 'Italic',
              fontSize: '0.95rem',
            },
          }),
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
              flexWrap: 'wrap',
              marginRight: '-5px',
              marginLeft: '-5px',
              '& .Luci-Button': {
                display: 'inline-block',
                fontSize: '1.0vw',
                fontFamily: 'Raleway',
                borderRadius: '50%',
                cursor: 'pointer',
                height: '1.44vw',
                width: '1.44vw',
                marginLeft: '1px',
                marginRight: '1px',
                padding: 0,
                backgroundColor: '#fff',
                color: '#666',
                transition: 'all 0.5s',
                '&.disabled': {
                  opacity: '0.5',
                },
                border: '1px solid #999',
                '&.selected': isLightMode
                  ? {
                      backgroundColor: '#999',
                      borderColor: '#999',
                      color: '#fff',
                    }
                  : {
                      backgroundColor: theme.palette.secondary.main,
                      borderColor: theme.palette.secondary.main,
                      color: theme.palette.secondary.dark,
                      fontWeight: '700',
                    },
                '&:hover:not(.selected)': {
                  position: 'sticky',
                  backgroundColor: theme.palette.secondary.light,
                  color: '#fff',
                  fontWeight: '700',
                  border: `1px solid ${theme.palette.secondary.light}`,
                },
                '&.selected:hover': {
                  backgroundColor: '#fff',
                  fontWeight: '700',
                  color: theme.palette.secondary.light,
                },
              },
            },
          }),
        },
      },
      //--------------------------------------------------------------------------
      /* Button */
      MuiButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            padding: '0',
            margin: 'auto',
            minWidth: '10px',
            whiteSpace: 'nowrap',
            textTransform: 'none',
            '&.MuiButton-contained': {
              padding: `${spacingFn(3)} ${spacingFn(6)}`,
              borderRadius: '2rem',
              '&:hover, &.Mui-focusVisible': isLightMode
                ? {
                    backgroundColor: theme.palette.primary.superLight,
                    color: theme.palette.primary.dark,
                  }
                : {
                    backgroundColor: theme.palette.primary.dark,
                    color: theme.palette.primary.light,
                  },
            },
            '&.matrix.download.round': {
              '& > .MuiButton-endIcon': {
                padding: '8px',
                borderRadius: '20px',
                color: '#fff',
                background: theme.palette.primary.main,
              },
              '&.disabled': {
                display: 'none',
              },
            },
          }),
        },
      },
      //----------------------------------------------------------------------------
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
        styleOverrides: {
          root: ({ theme }) => ({
            '&:hover': {
              backgroundColor: 'inherit',
            },
            '&.MuiFab-root': {},
            '&.Luci-button.error-flag': {
              marginTop: theme.spacing(5),
              marginBottom: theme.spacing(0),
              marginLeft: theme.spacing(3),
              color: theme.palette.error.main,
              '&.animated': {
                width: '30px',
                height: '30px',
              },
              '&.static': {
                width: '25px',
                height: '25px',
              },
              '&.hidden': {
                display: 'none',
              },
            },
            /* '&.Luci-ButtonBase': {
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
          }, */
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
            '&.Luci-IconButton.etlUnit.workbench': {
              marginLeft: 'auto',
              transform: 'rotate(0deg)',
              transition: theme.transitions.create('transform', {
                duration: theme.transitions.duration.shortest,
              }),
              '&.open': {
                transform: 'rotate(180deg)',
              },
            },
          }),
        },
      },
      //----------------------------------------------------------------------------
      /* FilledInput */
      MuiFilledInput: {
        styleOverrides: {
          root: {
            borderRadius: '6px 6px 0px 0px',
          },
        },
      },
      //----------------------------------------------------------------------------
      //----------------------------------------------------------------------------
      /* Luci custom style components */
      //----------------------------------------------------------------------------
      LuciDiv: {
        styleOverrides: {
          root: ({ theme }) => ({
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            //--------------------------------------------------------------------
            // main-app-view
            //--------------------------------------------------------------------
            '&.main-app-view': {
              display: 'inline-block',
              backgroundColor:
                theme.palette.mode === 'light'
                  ? theme.palette.grey[100]
                  : theme.palette.grey[900],
              flexGrow: 1,
              height: 'calc(100vh - var(--app-bar-height))',
              marginTop: 'var(--app-bar-height)',
            },
            //---------------------------------------------------------------------
            // Luci-matrix
            // Most of the formatting occurs in the MuiDataGrid
            // Coordinate with Luci-DataGrid-matrix
            //---------------------------------------------------------------------
            '&.Luci-matrix': {
              borderRadius: '0.5rem',
              display: 'block', // required to keep inside
              maxWidth: '100%',
              height: '100%',
              '& > .outer-container': {
                height: '100%',
                '& > .inner-make-scrollable-container': {
                  overflowX: 'auto',
                  height: '100%',
                },
              },
            },
            //----------------------------------------------------------------------
            // FieldData (FileField and EtlField views)
            //----------------------------------------------------------------------
            '&.Luci-FieldData.root.detail': {
              display: 'flex',
              flexDirection: 'column',
              margin: '1.5em 1em',
              marginBottom: '2em',
              backgroundColor: 'inherit',
              gap: '2em',
              '& > .footer': {
                width: '100%',
              },
              '& > .main-content': {
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignContent: 'flex-start',
                gap: '2em',
                width: '100%',
                //----------------------------------------------------------------------
                // column 1
                '& > .inputGroup': {
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  alignContent: 'flex-start',
                  gap: '1rem 0px',
                  width: '185px', // directly measured; avoid changing
                  flex: '0 0 auto',
                  '& > .delegate-item': {
                    width: '100%',
                  },
                  '& .MuiFormHelperText-root': {
                    color: theme.palette.grey[500],
                    lineHeight: '1.1rem',
                    textShadow: 'none',
                  },
                  '& .time-config': {
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
                //----------------------------------------------------------------------
                // column 2
                '& > .Luci-DataContainer.levels': {
                  display: 'flex',
                  flex: '1 1 0%',
                  maxWidth: '100%',
                  minWidth: '50%',
                  paddingLeft: '0px',
                  '& > .stack': {
                    width: '100%',
                  },
                  //--------------------------------------------------------------------
                  // Levels
                  //--------------------------------------------------------------------
                  '& .levels': {
                    display: 'flex',
                    flexDirection: 'column',
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
                  },
                },
              },
            },
            //--------------------------------------------------------------------
            // wide-to-long configuration
            //--------------------------------------------------------------------
            '&.Luci-WideToLongFileConfig': {
              '& .Luci-Table.factorNames': {
                width: '100%',
                tableLayout: 'fixed',
                '& .MuiTableCell-head': {},
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
              '& .Luci-Table.fieldNames': {
                '& thead tr th, tbody tr td': {
                  paddingLeft: '1em',
                },
                '& .MuiTableCell-body': {
                  border: 'none',
                },
                '& tbody tr:last-child td': {
                  paddingBottom: spacingFn(7),
                  borderBottom: `2px solid ${theme.palette.grey[300]}`,
                },
              },
              '& .Luci-Wide-Factors .Luci-TextField, & .factorWithMenu': {
                color: theme.palette.primary.main,
                '& > div': {
                  color: 'inherit',
                },
              },
              '& .factorWithMenu': {
                fontStyle: 'italic',
                fontSize: '1.2rem',
                maxWidth: '194px', // input + 50% menu button
                display: 'flex',
                justifyContent: 'space-between',
                '& >.menu, & >.text': {
                  marginTop: 'auto',
                },
                '& >.menu': {
                  transform: 'translateX(10px)',
                },
              },
            },
            //---------------------------------------------------------------------
            // SpanInput Div
            //---------------------------------------------------------------------
            '&.Luci-SpanLevel-Chip, &.Luci-SpanInput': {
              display: 'flex',
              borderRadius: 6,
              alignItems: 'center',
              backgroundColor: isLightMode
                ? theme.palette.primary.extraLight
                : theme.palette.themeColors['color-secondary-dark'],
              '& .title, & .subtitle': {
                color: isLightMode
                  ? theme.palette.primary.extraDark
                  : theme.palette.secondary.contrastText,
              },
              '& .subtitle': {
                filter: 'brightness(1.2)',
              },
              '& .icon': {
                display: 'flex',
                '& > svg': {
                  margin: 'auto',
                },
              },
            },
            '&.Luci-SpanInput': {
              justifyContent: 'space-between',
              minWidth: '180px',
              maxWidth: '400px',
              maxHeight: '40px',
              // coordinate with EtlUnit-CardHeader
              padding: '5px 4px 7px 8px',
              radius: '3px', // smaller radius
              // select
              '& > .Luci-SelectMenu': {
                '& .MuiSelect-select': {
                  select: {
                    '&:before': {
                      borderBottom: 'none',
                    },
                    '&:after': {
                      borderBottom: 'none',
                    },
                  },
                },
              },
              // form control
              '&.list': {
                backgroundColor: 'transparent',
                boxShadow: 'none',
                paddingTop: theme.spacing[0],
                paddingBottom: theme.spacing[2],
                paddingLeft: theme.spacing[2],
              },
              '& > .switch': {
                marginRight: '3px',
                marginLeft: '5px',
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
                paddingTop: spacingFn(3),
                paddingBottom: spacingFn(2),
              },
              // typography for switch
              '& .MuiTypography-body1': {
                fontSize: '0.6rem',
              },
              // divider
              '& .MuiDivider-root': {
                margin: `${spacingFn(0)} 0`,
              },
            },
            //----------------------------------------------------------------------
            // mspan chip Div
            //----------------------------------------------------------------------
            '&.Luci-SpanLevel-Chip': {
              boxShadow: theme.shadows[1],
              paddingTop: spacingFn(3),
              paddingRight: spacingFn(5),
              paddingBottom: spacingFn(3),
              paddingLeft: spacingFn(3),
              margin: `${spacingFn(3)} ${spacingFn(3)}`,
              height: 'min-content',
              width: 'max-content',
              '& .title': {},
              '& .icon': {
                flex: 0,
                marginTop: 6,
                marginRight: 10,
              },
            },
            //--------------------------------------------------------------------
            // SymbolMapMaker Div
            //--------------------------------------------------------------------
            '&.Luci-SymbolMapMaker': {
              padding: '0.2em',
              borderRadius: '0.5em',
              backgroundColor: isLightMode
                ? theme.palette.primary.extraLight
                : theme.palette.primary.main,
              '& >.layout': {
                flex: '1',
                overflow: 'hidden',
              },
              '& >.layout >.body, & .footer': {
                backgroundColor: theme.palette.themeColors['color-background-card'],
              },
              '& .body': {
                borderRadius: '6px 6px 6px 6px',
                maxHeight: '50vh',
                overflow: 'auto',
              },
              '& .stack': {
                display: 'flex',
                flexDirection: 'column',
              },
              '& .MuiAutocomplete-clearIndicator': {
                '& svg': {
                  fontSize: '0.8em',
                  fill: theme.palette.themeColors['color-icon'],
                },
              },
              // handle for the popper
              '& table > thead:hover': {
                cursor: 'pointer',
              },
              '& table > tbody': {
                maxHeight: '40vh',
                overflow: 'auto',
              },
              '& table > tfoot > tr > td': {
                paddingLeft: '0px',
                '& .Luci-ErrorCard': {
                  padding: '0.5em',
                  marginLeft: '0.5em',
                  borderRadius: '0.5em',
                  color: theme.palette.error.main,
                  backgroundColor: theme.palette.background.error,
                  minHeight: '65px',
                },
              },
            },
            '&.Luci-ErrorCard.symbolMapMaker': {
              alignItems: 'center',
              justifyContent: 'space-between',
              maxWidth: '95%',
              minHeight: '3.5em',
              '& .error-icon': {
                width: '30px',
                height: '30px',
              },
              '& .error-item': {
                margin: 'auto auto auto 1.0em',
                // width: '300px',
              },
              '& .hidden': {
                visibility: 'hidden',
              },
            },
            //----------------------------------------------------------------------------
            // AppBarSearchInput
            // force specialization
            '&.AppBarSearchInput': {
              padding: '8px 12px 8px 6px',
              alignItems: 'center',
              backgroundColor: theme.palette.grey[100],
              '& .input': {
                flex: 1,
              },
              '& .searchIcon': {
                width: '24px',
              },
              '& .sortIcon': {
                width: '24px',
              },
              '& .MuiTypography-body1': {
                fontSize: '0.8rem',
                // lineHeight: '0.8rem',
              },
              '& .MuiTableCell-head': {
                borderBottom: 'none',
                fontSize: '0.8rem',
                alignItems: 'center',
              },
              '& .MuiInputBase-root': {
                fontSize: '0.8rem',
              },
            },
            //----------------------------------------------------------------------------
            // EtlUnitCardHeader
            '&.EtlUnit-CardHeader.root': {
              alignItems: 'center',
              // coordinate padding & radius with
              // * MuiCardContent EtlUnit-parameter
              // * Luci-SpanInput
              padding: '5px 8px 7px 8px',
              '&.component-detailView, &.spanValues-detailView': {
                padding: `0px 0px 8px 0px`,
                margin: '0px',
              },
              backgroundColor: theme.palette.themeColors['color-background-title'],
              // coordinate radius with MuiCardContent EtlUnit-parameter
              borderRadius: '5px',
              '&.no-border, &.quality': {
                border: `none`,
              },
            },
            '& .EtlUnit-CardHeader-IconWrap': {
              display: 'flex',
              alignItems: 'center',
              padding: '0px 3px 0px 0px',
              '& .component': {
                padding: '0px',
              },
            },
            '& .EtlUnit-CardHeader-Name': {
              flex: 1,
              '& .MuiFormControl-root': {
                display: 'flex',
              },
            },
            '& .componentsInputTextSpanInput': {
              fontFamily: 'Lato',
              fontSize: '10px',
              lineHeight: '19px',
              color: theme.palette.primary.main,
            },
            '& .MuiDataGrid-main': {
              borderTopLeftRadius: '0.5em',
              borderTopRightRadius: '0.5em',
            },
            '& .Luci-Datagrid-footer': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.1em 0.5em',
              margin: `${spacingFn(2)} 0`,
              borderBottomLeftRadius: '0.5em',
              borderBottomRightRadius: '0.5em',
              backgroundColor: theme.palette.themeColors['color-background-footer'],
              filter: 'brightness(1.1)',
              '& .tools, & .Luci-DataGrid-actions': {
                display: 'flex',
                gap: '0.5em',
                padding: '0.5em',
                '& button': {
                  height: '24px',
                  width: '24px',
                  color: isLightMode
                    ? theme.palette.grey[900]
                    : theme.palette.grey[500],
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                  '& svg': {
                    height: '24px',
                    width: '24px',
                  },
                },
              },
              '& .Luci-DataGrid-actions': {
                gap: '0.5em',
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
            '& .EtlUnit-parameter': {
              '& .Luci-Datagrid-footer': {
                '& .tools, & .Luci-DataGrid-actions': {
                  gap: '1.1em',
                  '& button': {
                    height: '20px',
                    width: '20px',
                    '& svg': {
                      height: '20px',
                      width: '20px',
                    },
                  },
                },
              },
            },
          }),
        },
      },
    },
    props: {
      // Name of the component
      /* eslint-disable react/jsx-filename-extension */
    },
  });
};
