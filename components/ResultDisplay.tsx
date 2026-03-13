import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, RefreshCw, Copy, Check } from 'lucide-react';

interface ResultDisplayProps {
  content: string;
  onReset: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ content, onReset }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated_exam_${new Date().getTime()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Đề thi đã tạo</h2>
          <p className="text-slate-500">Dưới đây là nội dung đề thi được sinh ra bởi AI.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onReset}
            className="flex items-center px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            <RefreshCw size={18} className="mr-2" />
            Làm lại
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center px-4 py-2 border rounded-lg font-medium transition-colors ${
              copied 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {copied ? <Check size={18} className="mr-2" /> : <Copy size={18} className="mr-2" />}
            {copied ? 'Đã sao chép' : 'Sao chép'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-md transition-colors"
          >
            <Download size={18} className="mr-2" />
            Tải về (.md)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <span className="ml-4 text-xs font-mono text-slate-500">preview_mode.md</span>
        </div>
        <div className="p-8 md:p-12 overflow-y-auto max-h-[70vh] prose prose-slate prose-headings:text-slate-800 prose-p:text-slate-600 prose-strong:text-slate-900 max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
