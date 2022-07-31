import React from 'react';
import Menu from '../Menu.presentation';
import { render, fireEvent, cleanup } from '@testing-library/react';

describe('Menu', () => {
  afterEach(cleanup);
  describe('Clicking the button', () => {
    it('should show all options passed into it', () => {
      const options = ['test-a', 'test-b', 'test-c'];
      const { getByTestId, getAllByRole } = render(
        <Menu options={options}>
          {(onClick) => (
            <button data-testid='button' onClick={onClick}>
              Click
            </button>
          )}
        </Menu>,
      );

      fireEvent.click(getByTestId('button'));

      const menu = getAllByRole('menuitem');

      expect(menu.length).toEqual(options.length);
      expect(menu[0].innerHTML).toContain('test-a');
      expect(menu[1].innerHTML).toContain('test-b');
      expect(menu[2].innerHTML).toContain('test-c');
    });
  });
  describe('Clicking a menu item', () => {
    it('should call the with the selected item', () => {
      const options = ['test-a', 'test-b', 'test-c'];
      const callback = jest.fn();
      const { getByTestId, getByText } = render(
        <Menu options={options} onItemClick={callback}>
          {(onClick) => (
            <button data-testid='button' onClick={onClick}>
              Click
            </button>
          )}
        </Menu>,
      );

      // Show the menu
      fireEvent.click(getByTestId('button'));

      // Click the first item
      fireEvent.click(getByText('test-a'));

      expect(callback).toBeCalledWith('test-a', 0);
    });
  });
  describe('When there are no options', () => {
    it('should not show children', () => {
      const { queryByTestId } = render(
        <Menu>
          {(onClick) => (
            <button data-testid='button' onClick={onClick}>
              Click
            </button>
          )}
        </Menu>,
      );

      expect(queryByTestId('button')).toEqual(null);
    });
  });
});
