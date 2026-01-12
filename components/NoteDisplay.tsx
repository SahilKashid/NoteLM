import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Copy, Check } from 'lucide-react';

interface NoteDisplayProps {
  content: string;
}

const NoteDisplay: React.FC<NoteDisplayProps> = ({ content }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-neutral-900/50 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl flex flex-col h-full min-h-[600px] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20">
        <h2 className="font-medium text-white tracking-wide">Generated Notes</h2>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-400 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 hover:text-white transition-all active:scale-95"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy Markdown"}
        </button>
      </div>
      
      <div className="p-8 overflow-y-auto">
        {/* We use standard prose classes but override colors manually via tailwind config in index.html for simplicity, 
            or use specific utility classes here. Since we don't have the plugin build step, we style elements manually or use base prose with overrides. */}
        <div className="prose prose-invert prose-lg max-w-none 
          prose-headings:text-white prose-headings:font-semibold prose-headings:tracking-tight
          prose-p:text-neutral-300 prose-p:leading-relaxed
          prose-strong:text-white prose-strong:font-bold
          prose-ul:text-neutral-300 prose-li:marker:text-neutral-600
          prose-code:text-blue-300 prose-code:bg-blue-950/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-black prose-pre:border prose-pre:border-white/10
          prose-blockquote:border-l-white/20 prose-blockquote:text-neutral-400
          prose-th:text-white prose-th:bg-white/5 prose-td:text-neutral-300 prose-tr:border-white/5
        ">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              table: ({node, ...props}) => <div className="overflow-x-auto my-6 rounded-lg border border-white/10"><table className="min-w-full divide-y divide-white/10" {...props} /></div>,
              th: ({node, ...props}) => <th className="px-4 py-3 bg-white/5 text-left text-sm font-semibold text-white" {...props} />,
              td: ({node, ...props}) => <td className="px-4 py-3 border-t border-white/5 text-sm text-neutral-300" {...props} />,
              code: ({node, className, children, ...props}: any) => {
                const match = /language-(\w+)/.exec(className || '')
                const isInline = !match && !String(children).includes('\n');
                return !isInline ? (
                  <code className={`${className} !bg-transparent`} {...props}>
                    {children}
                  </code>
                ) : (
                  <code className="text-blue-300 bg-blue-950/30 px-1.5 py-0.5 rounded text-sm font-mono border border-blue-900/50" {...props}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default NoteDisplay;