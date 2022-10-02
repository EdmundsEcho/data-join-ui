import React from 'react';
import { PropTypes } from 'prop-types';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import Divider from '@mui/material/Divider';
import logo from '../core-app/assets/images/Logo.png';

import { useMarkdown } from '../hooks';

export const SinglePageWithMarkdown = ({ markdownFile, className }) => {
  const markdown = useMarkdown({ markdownFile });

  return (
    <div className={`main-page with-markdown root ${className}`}>
      <div className='markdown'>
        <ReactMarkdown source={markdown} remarkPlugins={[remarkGfm]}>
          {markdown}
        </ReactMarkdown>
      </div>

      <div className='footer'>
        <Divider />
        <p />
        <img src={logo} alt='Lucivia LLC' />
      </div>
    </div>
  );
};

SinglePageWithMarkdown.propTypes = {
  markdownFile: PropTypes.string.isRequired,
  className: PropTypes.string,
};
SinglePageWithMarkdown.defaultProps = {
  className: '',
};

export default SinglePageWithMarkdown;
