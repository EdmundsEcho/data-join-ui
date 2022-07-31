import React from 'react';
import SearchBar from '../SearchBar';

const fixture = (
  <div style={{ width: '330px', margin: '30px' }}>
    <SearchBar
      path='/this/is/my/path'
      filterText={() => {}}
      updateFilterText={() => {}}
    />
  </div>
);

export default fixture;
