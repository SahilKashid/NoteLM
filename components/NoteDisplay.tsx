import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Copy, Check, Download, FileCode } from 'lucide-react';

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

  const handleDownloadMd = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NoteLM_Notes.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    // Basic standalone HTML template with KaTeX and clean styling
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NoteLM Export</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 40px auto;
            padding: 0 20px;
            background-color: #fff;
        }
        pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        code {
            font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
            background: #f4f4f4;
            padding: 2px 4px;
            border-radius: 3px;
        }
        blockquote {
            border-left: 4px solid #ddd;
            margin: 0;
            padding-left: 20px;
            color: #666;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f8f8f8;
        }
        .math-display {
            overflow-x: auto;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div id="content">
        <!-- Note: This is a simplified HTML export. For full rendering, 
             the user would normally use a Markdown parser. -->
        <pre style="white-space: pre-wrap; font-family: inherit;">${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NoteLM_Notes.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-neutral-900/50 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl flex flex-col h-full min-h-[600px] overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 gap-4">
        <h2 className="font-medium text-white tracking-wide">Generated Notes</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleDownloadHtml}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-400 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 hover:text-white transition-all active:scale-95"
            title="Download as HTML"
          >
            <FileCode className="w-3.5 h-3.5" />
            Export HTML
          </button>
          <button 
            onClick={handleDownloadMd}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-400 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 hover:text-white transition-all active:scale-95"
            title="Download as Markdown"
          >
            <Download className="w-3.5 h-3.5" />
            Export .md
          </button>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-400 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 hover:text-white transition-all active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy Markdown"}
          </button>
        </div>
      </div>
      
      <div className="p-8 overflow-y-auto">
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