// src/components/AutoSuggestText.jsx

/**
 * Using this https://material-ui.com/demos/autocomplete/#react-autosuggest
 * as a starting point. This component takes an array of string suggestions
 * and renders a list of filtered suggestions while the user types.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import withStyles from '@mui/styles/withStyles';
import curry from 'lodash.curry';

/* eslint-disable react/destructuring-assignment */

const MAX_NUMBER_OF_SUGGESTIONS = 30;

/**
 * Helper function used to consistently clean text inputs
 * @param {string} text
 * @return {string} Trimmed and lowercase version of input
 */
const cleanText = (text) => text.trim().toLowerCase();

/**
 * This is a helper function that is used to work with lists of
 * suggestions. It provides a sane way to handle when the last item
 * of the list of suggestions is based on the query and has not yet
 * been added to the list of actual suggestions
 * @param {string[]} suggestions
 * @return {string[]} sanitized list of suggestions excluding last
 */
// const cleanSuggestions = suggestions => {
//  if (suggestions.length === 1) return suggestions.map (cleanText);
//  else return suggestions.map (cleanText).slice (0, -1);
// };

// SVG icon of the return icon used to communicate to
// the user that pressing the return key will select
// the currently hovered/highlighted item
const ReturnIcon = () => (
  <div style={{ float: 'right' }}>
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      viewBox='0 0 24 24'>
      <path d='M0 0h20v20H0z' fill='none' />
      <path d='M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z' />
    </svg>
  </div>
);

/**
 *
 * Used by react-autosuggest to render the input component
 * @component
 */
function renderInputComponent(inputProps) {
  const { classes, inputRef = () => {}, ref, ...other } = inputProps;

  return (
    <TextField
      fullWidth
      variant='outlined'
      InputProps={{
        inputRef: (node) => {
          ref(node);
          inputRef(node);
        },
        classes: {
          input: classes.input,
        },
      }}
      {...other}
    />
  );
}

/**
 *
 * @param {string[]} suggestions
 * @param {string} rawQuery raw input of user query
 */
export const getSuggestions = (suggestions, rawQuery) => {
  const cleanedSuggestions = suggestions.map(cleanText);
  const cleanedQuery = cleanText(rawQuery);
  const inputLength = rawQuery.length;
  const numberOfWords = rawQuery.split(' ').length;
  let count = 0;

  // If this is an exact match we only return the one suggestion
  if (numberOfWords > 1 && cleanedSuggestions.includes(cleanedQuery)) {
    // Get the index of the suggestion
    const index = cleanedSuggestions.indexOf(cleanedQuery);
    // Return the raw suggestion at the index of cleanedSuggestion
    // so it matches what the user expects even if the case didn't
    // match
    return [suggestions[index]];
  }

  // If we've selected the input but haven't entered anything
  // yet we show all options limited by MAX_NUMBER_OF_SUGGESTIONS
  if (inputLength === 0) {
    return suggestions.slice(0, MAX_NUMBER_OF_SUGGESTIONS);
  }

  const filtered = suggestions.filter((suggestion) => {
    const matches = match(cleanText(suggestion), cleanedQuery);

    const keep = count < MAX_NUMBER_OF_SUGGESTIONS && matches.length > 0; // suggestion.slice(0, inputLength).toLowerCase() === inputValue;

    if (keep) {
      count += 1;
    }

    return keep;
  });

  // If this query wasn't found we should append
  // to the list of filtered suggestions
  if (!cleanedSuggestions.includes(cleanedQuery))
    return filtered.concat(rawQuery);
  return filtered;
};

/**
 * renderSuggestion
 * This function returns a MenuItem component with or without additional helper text
 * to inform the user that a new codomain will be created
 * @param {array} allSuggestions All suggestions available used to determine if current suggestion already exists
 * @param {array} filteredSuggestions Filtered suggestion based on getSuggestions inputs
 * @param {string} suggestion The text of the suggestion item
 * @param {string} rawQuery Current TextField input
 * @param {boolean} isHighlighted Boolean for whether an item is highlighted
 * @returns {ReactComponent} MenuItem
 *
 * @component
 */
export const renderSuggestion = curry(
  (
    allSuggestions,
    filteredSuggestions,
    suggestion,
    { query: rawQuery, isHighlighted },
  ) => {
    const matches = match(suggestion, rawQuery);
    const cleanedSuggestion = cleanText(suggestion);
    const cleanedQuery = cleanText(rawQuery);
    const cleanedSuggestions = allSuggestions.map(cleanText);

    // Parts are words.
    const parts = parse(suggestion, matches);

    if (cleanedQuery === '' || cleanedSuggestions.includes(cleanedSuggestion)) {
      return (
        <MenuItem selected={isHighlighted} component='div'>
          <div className='suggestion-item' style={{ width: '100%' }}>
            {parts.map((part, index) =>
              part.highlight ? (
                <span key={String(index)} style={{ fontWeight: 500 }}>
                  {part.text}
                </span>
              ) : (
                <strong key={String(index)} style={{ fontWeight: 300 }}>
                  {part.text}
                </strong>
              ),
            )}
            {!isHighlighted ? null : <ReturnIcon />}
          </div>
        </MenuItem>
      );
    }

    // Returns the suggestion with helper text telling the
    // user that a new codomain will be created
    return (
      <MenuItem selected={isHighlighted} component='div'>
        <div style={{ width: '100%' }}>
          <span className='suggestion-item'>
            {`${rawQuery} (Create New Group)`}
            {!isHighlighted ? null : <ReturnIcon />}
          </span>
        </div>
      </MenuItem>
    );
  },
);

function getSuggestionValue(suggestion) {
  return suggestion;
}

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  container: {
    position: 'relative',
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing(),
    left: 0,
    right: 0,
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
});

class AutoSuggestText extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // We set this initially because this is controlled
      // after this point.
      input: this.props.defaultValue || '',
      allSuggestions: [],
      filteredSuggestions: [],
    };

    this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
  }

  handleSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      filteredSuggestions: getSuggestions(this.props.suggestions, value),
      allSuggestions: this.props.suggestions,
    });
  };

  handleSuggestionsClearRequested = () => {
    this.setState({
      filteredSuggestions: [],
    });
  };

  handleChange =
    (name) =>
    (event, { newValue }) => {
      this.setState({
        [name]: newValue,
      });
    };

  // This function is called when suggestion is selected.
  onSuggestionSelected(
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method },
  ) {
    // Only bubble up changes after something is selected
    this.props.onChange(suggestion.trim());
  }

  /**
   * Method used to evaluate inputs
   */
  hasError() {
    if (this.props.allowEmpty) return false;

    return this.state.input === '' && this.props.defaultValue === '';
  }

  render() {
    const { allSuggestions, filteredSuggestions } = this.state;
    const { classes, suggestionTypeText } = this.props;

    const autosuggestProps = {
      renderInputComponent,
      suggestions: filteredSuggestions,
      onSuggestionsFetchRequested: this.handleSuggestionsFetchRequested,
      onSuggestionsClearRequested: this.handleSuggestionsClearRequested,
      getSuggestionValue,
      renderSuggestion: renderSuggestion(allSuggestions, filteredSuggestions),
      highlightFirstSuggestion: true,
      onSuggestionSelected: this.onSuggestionSelected,
      shouldRenderSuggestions: () => true, // We always want to display suggestions when input is focused
    };

    return (
      <div className={classes.root}>
        <Autosuggest
          {...autosuggestProps}
          inputProps={{
            error: this.hasError(),
            classes,
            placeholder: `Choose ${suggestionTypeText}`,
            value: this.state.input,
            onChange: this.handleChange('input'),
          }}
          theme={{
            container: classes.container,
            suggestionsContainerOpen: classes.suggestionsContainerOpen,
            suggestionsList: classes.suggestionsList,
            suggestion: classes.suggestion,
          }}
          renderSuggestionsContainer={(options) => (
            <Paper
              {...options.containerProps}
              square
              style={{ maxHeight: 300, overflowY: 'scroll' }}>
              {options.children}
            </Paper>
          )}
        />
      </div>
    );
  }
}

AutoSuggestText.propTypes = {
  allowEmpty: PropTypes.bool,
  classes: PropTypes.shape({}).isRequired,
  defaultValue: PropTypes.string,
  suggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  suggestionTypeText: PropTypes.string,
};

AutoSuggestText.defaultProps = {
  allowEmpty: false,
  defaultValue: undefined,
  suggestionTypeText: 'Suggestion',
};

export default withStyles(styles)(AutoSuggestText);
