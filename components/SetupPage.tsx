import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileType, BookOpen, List, PenTool, ArrowRight, FileText, X, Upload, Loader2, FileUp, FileInput, Save, Download, Trash2, Sparkles, AlertTriangle } from 'lucide-react';
import { parseDocx } from '../services/fileService';
import { saveConfig, loadConfigs, deleteConfig } from '../services/storageService';
import { ExamConfig, SavedConfig } from '../types';

interface SetupPageProps {
  initialConfig: ExamConfig;
  onSubmit: (config: ExamConfig) => void;
}

// Extracted component to prevent re-rendering and focus loss
interface InputWithFileUploadProps {
  label: string;
  icon: any;
  value: string;
  placeholder: string;
  isParsing: boolean;
  onTextChange: (value: string) => void;
  onFileSelect: (file: File) => void;
}

const InputWithFileUpload: React.FC<InputWithFileUploadProps> = ({ 
  label, 
  icon: Icon, 
  value, 
  placeholder,
  isParsing,
  onTextChange,
  onFileSelect
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-slate-700 flex items-center">
          <Icon size={16} className="mr-2 text-primary-500" />
          {label}
        </label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-xs flex items-center text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-2 py-1 rounded transition-colors"
          disabled={isParsing}
        >
          {isParsing ? <Loader2 className="animate-spin mr-1" size={12}/> : <FileUp size={12} className="mr-1" />}
          Tải file Word
        </button>
        <input
          type="file"
          ref={fileRef}
          className="hidden"
          accept=".docx,.doc"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              onFileSelect(e.target.files[0]);
              e.target.value = ''; // reset
            }
          }}
        />
      </div>
      <textarea
        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all min-h-[100px] text-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onTextChange(e.target.value)}
      />
    </div>
  );
};

export const SetupPage: React.FC<SetupPageProps> = ({ initialConfig, onSubmit }) => {
  const [config, setConfig] = useState<ExamConfig>(initialConfig);
  const [isDragging, setIsDragging] = useState(false);
  const [parsingField, setParsingField] = useState<string | null>(null);
  
  // Storage State
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [configName, setConfigName] = useState('');

  const mainFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSavedConfigs(loadConfigs());
  }, []);

  // Helper to handle parsing docx
  const handleParse = async (file: File): Promise<string> => {
    try {
      if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
        alert('Vui lòng chọn file Word (.docx, .doc)');
        return '';
      }
      return await parseDocx(file);
    } catch (e) {
      console.error(e);
      alert('Lỗi khi đọc file');
      return '';
    }
  };

  // Handler for Main Sample Exam Upload
  const handleSampleUpload = async (file: File) => {
    setParsingField('sample');
    const text = await handleParse(file);
    if (text) {
      setConfig(prev => ({ ...prev, sampleText: text, fileName: file.name }));
    }
    setParsingField(null);
  };

  // Handler for supplementary uploads (Vocab, Grammar, Topics, Source Text)
  const handleSupplementaryUpload = async (file: File, field: keyof ExamConfig) => {
    setParsingField(field);
    const text = await handleParse(file);
    if (text) {
      setConfig(prev => ({
        ...prev,
        [field]: prev[field] ? `${prev[field]}\n${text}` : text
      }));
    }
    setParsingField(null);
  };

  // Drag and Drop handlers for Main Sample
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleSampleUpload(e.dataTransfer.files[0]);
  };

  const handleSaveConfig = () => {
    if (!configName.trim()) return;
    saveConfig(config, configName);
    setSavedConfigs(loadConfigs());
    setShowSaveModal(false);
    setConfigName('');
  };

  const handleLoadConfig = (saved: SavedConfig) => {
    setConfig({
      sampleText: saved.sampleText,
      fileName: saved.fileName,
      sourceText: saved.sourceText || '',
      topics: saved.topics,
      vocabulary: saved.vocabulary,
      grammar: saved.grammar,
      difficultyContext: saved.difficultyContext,
      readingDistractorGuide: saved.readingDistractorGuide || ''
    });
    setShowLoadModal(false);
  };

  const handleDeleteConfig = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa cấu hình này?')) {
      deleteConfig(id);
      setSavedConfigs(loadConfigs());
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Sample Exam Upload */}
      <div className="lg:col-span-5 space-y-6">
        <div className="sticky top-24">
          <h3 className="text-xl font-bold text-slate-800 mb-4">1. Cấu trúc đề mẫu</h3>
          <p className="text-slate-600 text-sm mb-4">
            Tải lên file đề thi mẫu (Word) để AI phân tích cấu trúc, số lượng câu hỏi và định dạng.
          </p>

          {!config.fileName ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => mainFileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
                ${isDragging 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'
                }
              `}
            >
              <input type="file" ref={mainFileInputRef} onChange={(e) => e.target.files?.[0] && handleSampleUpload(e.target.files[0])} accept=".docx,.doc" className="hidden" />
              
              <div className="flex flex-col items-center space-y-3">
                <div className={`p-3 rounded-full ${isDragging ? 'bg-primary-100' : 'bg-slate-100'}`}>
                  {parsingField === 'sample' ? (
                     <Loader2 className="animate-spin text-primary-600" size={24} />
                  ) : (
                    <UploadCloud size={24} className={isDragging ? 'text-primary-600' : 'text-slate-400'} />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-slate-700">Tải lên đề mẫu</p>
                  <p className="text-xs text-slate-500">.DOCX hoặc .DOC</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-xl border border-primary-200 shadow-sm bg-primary-50/50">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <FileText className="text-primary-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm break-all">{config.fileName}</h4>
                    <span className="inline-flex items-center text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full mt-1">
                      <FileType size={10} className="mr-1"/> Đã tải lên
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setConfig({ ...config, fileName: '', sampleText: '' })}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
             <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-2">Lời khuyên</h4>
             <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
               <li>Đề mẫu nên có cấu trúc rõ ràng (Section A, Question 1, etc.).</li>
               <li>AI sẽ cố gắng giữ nguyên format của đề mẫu này.</li>
             </ul>
          </div>
        </div>
      </div>

      {/* Right Column: Configuration Form */}
      <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">2. Thiết lập nội dung</h3>
          <button
            type="button"
            onClick={() => setShowLoadModal(true)}
            className="text-sm flex items-center text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download size={16} className="mr-1.5" />
            Mở cấu hình đã lưu
          </button>
        </div>
        
        <form className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
             <InputWithFileUpload
              label="Văn bản nguồn (Source Text - Tùy chọn)"
              icon={FileInput}
              value={config.sourceText || ''}
              placeholder="Dán bài báo, câu chuyện hoặc đoạn văn bạn muốn dùng làm bài đọc/bài đục lỗ tại đây. Nếu để trống, AI sẽ tự viết."
              isParsing={parsingField === 'sourceText'}
              onTextChange={(val) => setConfig({ ...config, sourceText: val })}
              onFileSelect={(file) => handleSupplementaryUpload(file, 'sourceText')}
            />
            <p className="text-xs text-blue-600 mt-2">
              💡 Nếu có văn bản này, AI sẽ ưu tiên dùng nó để tạo câu hỏi đục lỗ theo cấu trúc đề mẫu.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-4">
             <p className="text-sm font-semibold text-slate-500 mb-4 uppercase">Hoặc tạo mới dựa trên gợi ý:</p>
             <div className="space-y-6">
                <InputWithFileUpload
                  label="Chủ đề lớn (Topics)"
                  icon={BookOpen}
                  value={config.topics}
                  placeholder="VD: Global Warming, AI, Education..."
                  isParsing={parsingField === 'topics'}
                  onTextChange={(val) => setConfig({ ...config, topics: val })}
                  onFileSelect={(file) => handleSupplementaryUpload(file, 'topics')}
                />

                <InputWithFileUpload
                  label="Danh sách từ vựng (Vocabulary)"
                  icon={List}
                  value={config.vocabulary}
                  placeholder="VD: sustainable, ecosystem, renewable energy..."
                  isParsing={parsingField === 'vocabulary'}
                  onTextChange={(val) => setConfig({ ...config, vocabulary: val })}
                  onFileSelect={(file) => handleSupplementaryUpload(file, 'vocabulary')}
                />

                <InputWithFileUpload
                  label="Chủ điểm ngữ pháp (Grammar)"
                  icon={PenTool}
                  value={config.grammar}
                  placeholder="VD: Conditional sentences type 2, Passive voice..."
                  isParsing={parsingField === 'grammar'}
                  onTextChange={(val) => setConfig({ ...config, grammar: val })}
                  onFileSelect={(file) => handleSupplementaryUpload(file, 'grammar')}
                />

                <InputWithFileUpload
                  label="Hướng dẫn viết nhiễu (Reading Distractors)"
                  icon={AlertTriangle}
                  value={config.readingDistractorGuide || ''}
                  placeholder="VD: Tránh dùng từ phủ định kép, tập trung vào lỗi logic nguyên nhân-kết quả..."
                  isParsing={parsingField === 'readingDistractorGuide'}
                  onTextChange={(val) => setConfig({ ...config, readingDistractorGuide: val })}
                  onFileSelect={(file) => handleSupplementaryUpload(file, 'readingDistractorGuide')}
                />
             </div>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-3">
            <button
              type="button"
              onClick={() => onSubmit(config)}
              disabled={!config.sampleText}
              className={`
                w-full flex items-center justify-center font-bold text-lg px-6 py-4 rounded-xl shadow-lg transition-all transform
                ${!config.sampleText 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white hover:scale-[1.02] shadow-primary-200'
                }
              `}
            >
              <Sparkles className="mr-2" size={20} />
              Bắt đầu tạo đề thi
              <ArrowRight className="ml-2" size={20} />
            </button>

            <button
              type="button"
              onClick={() => setShowSaveModal(true)}
              className="w-full flex items-center justify-center font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 px-6 py-3 rounded-xl transition-colors"
            >
              <Save className="mr-2" size={18} />
              Lưu cấu hình này
            </button>

            {!config.sampleText && (
               <p className="text-center text-xs text-red-400 mt-2">Vui lòng tải lên đề mẫu trước khi tiếp tục.</p>
            )}
          </div>
        </form>
      </div>

      {/* Loading Overlay */}
      {(parsingField) && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white p-4 rounded-xl shadow-2xl flex items-center space-x-3 border border-primary-100">
            <Loader2 className="animate-spin text-primary-600" />
            <span className="font-medium text-slate-700">Đang đọc file...</span>
          </div>
        </div>
      )}

      {/* Save Config Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Lưu cấu hình</h3>
              <button onClick={() => setShowSaveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">Đặt tên cho cấu hình này để dễ dàng tìm lại sau này.</p>
            <input
              type="text"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="VD: Đề thi giữa kỳ 1 - Lớp 10"
              className="w-full p-3 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-primary-500 outline-none"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowSaveModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
              <button 
                onClick={handleSaveConfig}
                disabled={!configName.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Config Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Cấu hình đã lưu</h3>
              <button onClick={() => setShowLoadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {savedConfigs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Save size={48} className="mx-auto mb-3 opacity-20" />
                  <p>Chưa có cấu hình nào được lưu.</p>
                </div>
              ) : (
                savedConfigs.map((saved) => (
                  <div 
                    key={saved.id}
                    onClick={() => handleLoadConfig(saved)}
                    className="group p-4 border border-slate-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 cursor-pointer transition-all flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-800 group-hover:text-primary-700">{saved.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(saved.createdAt).toLocaleDateString('vi-VN')} • {saved.fileName || 'Không có file mẫu'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConfig(saved.id, e)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};