import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../Styles/MarkdownViewer.css';

export default function MarkdownViewer({ content, onUpdate }) {
  if (!content) return null;

  const handleCheckboxChange = (index) => {
    if (!onUpdate) return;

    let checkboxCount = 0;

    const updatedContent = content.replace(/([*+-])\s+\[([ xX])\]/g, (match, bullet, checkedState) => {
      if (checkboxCount === index) {
        const newState = (checkedState === ' ' || checkedState === '') ? 'x' : ' ';
        checkboxCount++;
        return `${bullet} [${newState}]`;
      }
      checkboxCount++;
      return match;
    });

    onUpdate(updatedContent);
  };

  let checkboxIndex = 0;

  return (
    <div className="markdown-viewer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // eslint-disable-next-line no-unused-vars
          input({ node, checked, ...props }) {
            if (props.type === 'checkbox') {
              const currentIndex = checkboxIndex++;
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    handleCheckboxChange(currentIndex);
                  }}
                  onClick={(e) => {
                    // Prevent click from bubbling up to parent cards (like BigTargets opening edit modal)
                    e.stopPropagation();
                  }}
                  style={{ cursor: onUpdate ? 'pointer' : 'default', accentColor: 'var(--primary)', marginRight: '6px' }}
                />
              );
            }
            return <input {...props} />;
          },
          li({ children }) {
            return <li style={{ listStylePosition: 'outside', marginLeft: '20px', marginBottom: '4px' }}>{children}</li>;
          },
          p({ children }) {
            return <p style={{ marginBottom: '8px', marginTop: 0 }}>{children}</p>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
