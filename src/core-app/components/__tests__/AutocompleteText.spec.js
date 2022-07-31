import { renderSuggestion, getSuggestions } from '../AutoSuggestText';
import { shallow } from 'enzyme';

describe('AutoCompleteText Component', () => {
  describe('getSuggestions', () => {
    it('should return the entire list when no input given', () => {
      const suggestions = ['a', 'b', 'c'];
      expect(getSuggestions(suggestions, '')).toEqual(suggestions);
    });

    it('should return the value provided if no matches found', () => {
      const suggestions = ['a', 'b', 'c'];
      expect(getSuggestions(suggestions, 'd')).toEqual(['d']);
      expect(getSuggestions(suggestions, 'D')).toEqual(['D']);
    });

    it('should match all instances of words', () => {
      const suggestions = ['a', 'aa', 'aaa', 'b', 'c'];
      expect(getSuggestions(suggestions, 'a')).toEqual(['a', 'aa', 'aaa']);
      expect(getSuggestions(suggestions, 'A')).toEqual(['a', 'aa', 'aaa']);
      expect(getSuggestions(suggestions, 'aA')).toEqual(['aa', 'aaa']);
      expect(getSuggestions(suggestions, 'AA')).toEqual(['aa', 'aaa']);
      expect(getSuggestions(suggestions, 'Aa')).toEqual(['aa', 'aaa']);
    });

    it('should handle mutliple words in a query', () => {
      const suggestions = ['multi word', 'word', 'wordy', 'unique'];
      expect(getSuggestions(suggestions, 'multi word')).toEqual(['multi word']);
      expect(getSuggestions(suggestions, 'Multi word')).toEqual(['multi word']);
      expect(getSuggestions(suggestions, 'Multi Word')).toEqual(['multi word']);
      expect(getSuggestions(suggestions, 'MuLtI WoRd')).toEqual(['multi word']);
    });

    it('should match on the second word also', () => {
      const suggestions = ['multi word', 'word', 'wordy', 'unique'];
      expect(getSuggestions(suggestions, 'word')).toEqual([
        'multi word',
        'word',
        'wordy',
      ]);
    });
  });

  // renderSuggestion returns a MenuItem component
  // depending on inputs.
  describe('renderSuggestion', () => {
    const existing = [
      'Government Aid',
      'Private',
      'Another 1',
      'Another 2',
      'Another 3',
      'Another 4',
    ];
    it('should offer to create a new group if query is new', () => {
      const meta = { query: 'Gov', isHighlighted: false };
      const wrapper = shallow(
        renderSuggestion(existing, existing, 'Gov', meta),
      );
      const expected = 'Gov (Create New Group)';
      expect(wrapper.find('.suggestion-item').text()).toEqual(expected);
    });

    it('should not offer to create as new if query matches existing groups', () => {
      const meta = { query: 'Private', isHighlighted: false };
      const wrapper = shallow(
        renderSuggestion(existing, existing, 'Private', meta),
      );
      const expected = 'Private';
      expect(wrapper.find('.suggestion-item').text()).toEqual(expected);
    });
  });
});
