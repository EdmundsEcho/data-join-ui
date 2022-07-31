import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CardHeaderWithToggle from './CardHeaderWithToggle';

describe('ClosableCard', () => {
  afterEach(cleanup);

  const testId = 'closable-card-close-button';

  it('should call the onCloseClick callback', () => {
    const callback = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <CardHeaderWithToggle canClose onCloseClick={callback} />,
    );

    // The close button should exist
    expect(queryByTestId(testId)).not.toBeNull();

    // And when clicked it should trigger the callback
    const closeButton = getByTestId(testId);
    fireEvent.click(closeButton);
    expect(callback).toHaveBeenCalled();
  });
  it('should not show x button if canClose=false', () => {
    const { queryByTestId } = render(<CardHeaderWithToggle />);

    expect(queryByTestId(testId)).toBeNull();
  });
  it('should render children', () => {
    const { queryByTestId } = render(
      <CardHeaderWithToggle>
        <div data-testid='child' />
      </CardHeaderWithToggle>,
    );

    expect(queryByTestId('child')).not.toBeNull();
  });
  it('should display a title', () => {
    const { findByText } = render(<CardHeaderWithToggle title='My Title' />);

    expect(findByText('My Title')).not.toBeNull();
  });
  it('should display a sub-heading', () => {
    const { findByText } = render(
      <CardHeaderWithToggle subheader='My Subheading' />,
    );

    expect(findByText('My Subheading')).not.toBeNull();
  });
});
