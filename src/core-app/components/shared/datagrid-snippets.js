import { XGrid as DataGrid, getGridStringOperators } from '@material-ui/x-grid';

const InputComponent = getGridStringOperators()[0]?.InputComponent ?? (
  <pre>Error</pre>
);

const InputComponentProps = getGridStringOperators()[0]
  ?.InputComponentProps ?? { type: 'string' };

// 3 filter operators for levels
const filterOperators = [
  getGridStringOperators().find(({ value }) => value === 'contains'),

  {
    label: 'before',
    value: 'before',

    getApplyFilterFn: (filterItem, column) => {
      if (
        !filterItem.columnField ||
        !filterItem.value ||
        !filterItem.operatorValue
      ) {
        return null;
      }

      return (params) => {
        const rowValue = column.valueGetter
          ? column.valueGetter(params)
          : params.value;
        return rowValue <= filterItem.value;
      };
    },
    InputComponent,
    InputComponentProps,
  },
  {
    label: 'after',
    value: 'after',

    getApplyFilterFn: (filterItem, column) => {
      if (
        !filterItem.columnField ||
        !filterItem.value ||
        !filterItem.operatorValue
      ) {
        return null;
      }

      return (params) => {
        const rowValue = column.valueGetter
          ? column.valueGetter(params)
          : params.value;
        return rowValue >= filterItem.value;
      };
    },
    InputComponent,
    InputComponentProps,
  },
];
