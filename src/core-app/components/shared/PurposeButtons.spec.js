import React from 'react';
import PurposeButtons from './PurposeButtons';
import '@testing-library/jest-dom/extend-expect';
import { render, fireEvent, cleanup } from '@testing-library/react';

describe('PurposeButtons', () => {
  afterEach(cleanup);
  it('should render initially with the value set', () => {
    const onClick = jest.fn();
    const { getByText } = render(
      <PurposeButtons
        showSubject
        showQuality
        value='subject'
        onPurposeChange={onClick}
      />,
    );

    expect(getByText('S').className).toEqual('selected');
    expect(onClick).not.toHaveBeenCalled();
  });
  it('should not break if no value given initially', () => {
    const onClick = jest.fn();
    const { getByText } = render(
      <PurposeButtons showSubject showQuality onPurposeChange={onClick} />,
    );

    expect(getByText('S').title).toEqual('Subject');
    expect(getByText('Q').title).toEqual('Quality');
  });
  it('should call the callback when a button is clicked', () => {
    const onClick = jest.fn();
    const { getByText } = render(
      <PurposeButtons showSubject onPurposeChange={onClick} />,
    );

    // Simulate clicking the S button
    fireEvent.click(getByText('S'));
    expect(onClick).toHaveBeenCalledWith('subject');
  });
});
