//--------------------------------------------------------------------------
/* Table */
//--------------------------------------------------------------------------
const abc = {
  MuiTable: {
    styleOverrides: {
      root: {
        // default
        '& thead tr th, & tbody tr td': {
          padding: `${spacingFn(3)} ${spacingFn(3)}`,
        },
        '& thead tr': {
          verticalAlign: 'bottom',
        },
        '& tbody tr': {
          cursor: 'pointer',
        },
        '& .Luci-Toggle': {
          width: '40px',
          '& .MuiIconButton-root': {
            '&.expand': {
              transform: 'rotate(0deg)',
              marginLeft: 'auto',
              transition: muiBaseTheme.transitions.create('transform', {
                duration: muiBaseTheme.transitions.duration.shortest,
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
              backgroundColor: palette.secondary.superLight,
            },
          },
          //--------------------------------------------------------------------
          // wtl configuration
          //--------------------------------------------------------------------
          '&.factorNames': {
            width: '100%',
            tableLayout: 'fixed',
            '& .MuiTableCell-head': {
              backgroundColor: palette.secondary.superLight,
            },
            '& thead tr th:first-child': {
              width: '170px',
            },
            '& tbody tr td': {
              border: 'none',
            },
            '& tbody tr[class*=nowInView] td': {
              borderBottom: `1.5px solid ${palette.grey[300]}`,
            },
            '& thead tr th:last-child': {
              width: '50px',
            },
            '& tr[class*=summaryView] .MuiTableCell-body': {
              '& .MuiInputBase-root': {
                color: palette.primary.main,
                fontStyle: 'italic',
              },
            },
          },
          //--------------------------------------------------------------------
          // Etl fields
          //--------------------------------------------------------------------
          '&.etlFields, &.etlUnitMeas': {
            '& .MuiTableCell-head': {
              backgroundColor: palette.grey[200],
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
              backgroundColor: palette.primary.superLight,
            },
          },
        },
      },
    },
  },
};
