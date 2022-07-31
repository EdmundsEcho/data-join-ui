import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import IntervalBox from './IntervalBox';

describe('IntervalBox', () => {
  afterEach(cleanup);
  describe('unit', () => {
    it('should render an empty HeadingBox when no unit or count value given', () => {
      const { queryByText } = render(<IntervalBox />);

      expect(queryByText('Unit')).toBeNull();

      expect(queryByText('Count')).toBeNull();
    });
    it('should render a value based on ', () => {
      const { getByText, container } = render(<IntervalBox unit='M' />);

      // Initially we set the value of unit to Month
      expect(getByText('Month')).not.toBeNull();

      // Then we change the value to Year
      render(<IntervalBox unit='Y' />, { container });

      // And find it
      expect(getByText('Year')).not.toBeNull();
    });
  });
  describe('count', () => {
    it('should render with the value', () => {
      const { getByDisplayValue } = render(<IntervalBox count={199} />);

      expect(getByDisplayValue('199')).not.toBeNull();
    });
    it('should call the callback when the value is increased by 1', () => {
      const callback = jest.fn();
      const { getByDisplayValue } = render(
        <IntervalBox count={199} onFieldChange={callback} />,
      );

      const input = getByDisplayValue('199');

      fireEvent.change(input, { target: { value: 200 } });

      expect(callback).toBeCalledWith('time.interval.count', 200);
    });
    it('should call the callback when the value is decreased by 1', () => {
      const callback = jest.fn();
      const { getByDisplayValue } = render(
        <IntervalBox count={200} onFieldChange={callback} />,
      );

      const input = getByDisplayValue('200');

      fireEvent.change(input, { target: { value: 199 } });

      expect(callback).toBeCalledWith('time.interval.count', 199);
    });
  });
});
