import { useEffect, useState } from 'react';

export function useMarkdown({ markdownFile }) {
  // two hooks to load markdown
  const [markdown, setMarkdown] = useState(() => '###### ...loading');
  useEffect(() => {
    fetch(markdownFile)
      .then((response) => response.text())
      .then((text) => {
        setMarkdown(text);
      });
  }, [markdownFile]);

  return markdown;
}

export default useMarkdown;
