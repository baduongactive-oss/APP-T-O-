import React, { useState } from 'react';
import { ExamConfig } from '../types';
import { BookOpen, List, PenTool, ArrowRight, ArrowLeft, FileText } from 'lucide-react';

interface ConfigFormProps {
  initialData: Partial<ExamConfig>;
  fileName: string;
  onBack: () => void;
  onSubmit: (config: { topics: string; vocabulary: string; grammar: string }) => void;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ initialData, fileName, onBack, onSubmit }) => {
  const [topics, setTopics] = useState(initialData.topics || '');
  const [vocabulary, setVocabulary] = useState(initialData.vocabulary || '');
  const [grammar, setGrammar] = useState(initialData.grammar || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ topics, vocabulary, grammar });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 flex items-center p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-800">
        <FileText size={20} className="mr-2" />
        <span className="font-medium">Đang sử dụng cấu trúc từ file: </span>
        <span className="ml-2 font-bold">{fileName}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-xl font-bold text-slate-800">Thiết lập ngữ liệu</h3>
          <p className="text-slate-600 text-sm">
            Cung cấp các thông tin dưới đây để AI tạo ra đề thi sát với chương trình học hoặc mục tiêu ôn tập của bạn.
          </p>
          
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <h4 className="font-semibold text-slate-800 mb-2">Lời khuyên</h4>
            <ul className="text-sm text-slate-500 space-y-2 list-disc pl-4">
              <li>Liệt kê các chủ đề rõ ràng (ví dụ: Environment, Technology).</li>
              <li>Cung cấp danh sách từ vựng cụ thể nếu muốn kiểm tra từ đó.</li>
              <li>Ghi rõ cấu trúc ngữ pháp (ví dụ: Passive Voice, Conditional sentences).</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          
          {/* Topics */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
              <BookOpen size={16} className="mr-2 text-primary-500" />
              Chủ đề lớn (Topics)
            </label>
            <textarea
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all min-h-[100px]"
              placeholder="Ví dụ: Global Warming, Artificial Intelligence, Healthy Lifestyle..."
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
            />
          </div>

          {/* Vocabulary */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
              <List size={16} className="mr-2 text-primary-500" />
              Danh sách từ vựng (Vocabulary)
            </label>
            <textarea
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all min-h-[100px]"
              placeholder="Ví dụ: sustainable, emission, biodiversity, algorithm, database..."
              value={vocabulary}
              onChange={(e) => setVocabulary(e.target.value)}
            />
          </div>

          {/* Grammar */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
              <PenTool size={16} className="mr-2 text-primary-500" />
              Chủ điểm ngữ pháp (Grammar Points)
            </label>
            <textarea
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all min-h-[100px]"
              placeholder="Ví dụ: Present Perfect vs Past Simple, Relative Clauses, Inversion..."
              value={grammar}
              onChange={(e) => setGrammar(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center text-slate-600 hover:text-slate-900 font-medium px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" />
              Quay lại
            </button>
            <button
              type="submit"
              className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-md shadow-primary-200 transition-all transform hover:scale-[1.02]"
            >
              Tạo đề thi ngay
              <ArrowRight size={18} className="ml-2" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
