const styles = (theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',

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
    // force specialization
    '&.header-root': {
      alignItems: 'center',
      padding: '5px 8px 7px 8px',
      '&.component-detailView, &.spanValues-detailView': {
        padding: `0px 0px 8px 0px`,
        margin: '0px',
      },
    },
    // target child
    '& .EtlUnit-CardHeader-IconWrap': {
      display: 'flex',
      alignItems: 'center',
      padding: '0px 3px 0px 0px',
      '& .component': {
        padding: '0px',
      },
    },
    // target child
    '& .EtlUnit-CardHeader-Name': {
      flex: 1,
      '& .MuiFormControl-root': {
        display: 'flex',
      },
    },
    //----------------------------------------------------------------------------
  },
  // ⬜ Use MuiTypography + classname to input this in overrides
  componentsInputText: {
    ...theme.typography.etlUnit.componentsInputText,
  },
  componentsHelperText: { ...theme.typography.etlUnit.componentsHelperText },
  componentsInputLabelEtlUnitParameter: {
    ...theme.typography.componentsInputLabelEtlUnitParameter,
  },
});

export default styles;
