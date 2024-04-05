import React from 'react';
import { useSelect } from 'react-cosmos/client';
import Span from '../Span';

import data from '../../../datasets/store-headerviews_v2.json';

const field = Object.values(data.headerView.headerViews)[0].fields.find(
  (fld) => fld.enabled && fld.purpose === 'mspan',
);

const Component = () => {
  const [format] = useSelect('format', {
    default: 'YYYY-MM-DD',
    options: ['YYYY-MM', 'YYYY-MM-DD', 'MM-YYYY'],
  });

  // const { reference, unit, span, spanIndex, format = null } = props;
  return (
    <Span
      reference={field.time.reference}
      unit={field.time.interval.unit}
      span={{ rangeStart: 0, rangeLength: 3 }}
      format={format}
    />
  );
};

export default Component;
