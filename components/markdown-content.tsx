import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'

const markdownComponents: Components = {
  p: ({children}) => <p>{children}</p>,
  code: ({children, className}) => (
    <code className={`bg-gray-200 dark:bg-gray-700 rounded px-1 py-0.5 ${className || ''}`}>{children}</code>
  ),
  strong: ({children}) => <strong className="font-bold">{children}</strong>,
  em: ({children}) => <em className="italic">{children}</em>,
  ol: ({children}) => <ol className="list-decimal pl-5">{children}</ol>,
  ul: ({children}) => <ul className="list-disc pl-5">{children}</ul>,
  li: ({children}) => <li>{children}</li>,
}

export function MarkdownContent({ children }: { children: string }) {
  return (
    <ReactMarkdown components={markdownComponents}>
      {children}
    </ReactMarkdown>
  )
} 