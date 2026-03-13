import React, { useRef, useState } from 'react';
import { UploadCloud, FileType } from 'lucide-react';
import { parseDocx } from '../services/fileService';

interface FileUploadProps {
  onFileParsed: (text: string, fileName: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileParsed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (!file) return;
    
    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      setError('Vui lòng tải lên file định dạng .docx hoặc .doc');
      return;
    }

    setError(null);
    setIsParsing(true);

    try {
      const text = await parseDocx(file);
      if (!text || text.trim().length === 0) {
        throw new Error("Không tìm thấy nội dung văn bản trong file.");
      }
      onFileParsed(text, file.name);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi đọc file. Hãy chắc chắn file không bị hỏng.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Tải lên đề thi mẫu</h2>
        <p className="text-slate-500 mt-2">
          Chúng tôi sẽ phân tích cấu trúc file Word của bạn để tạo ra đề thi tương tự.
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
          ${isDragging 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'
          }
        `}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={handleChange}
          accept=".docx,.doc"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full ${isDragging ? 'bg-primary-100' : 'bg-slate-100'}`}>
            {isParsing ? (
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            ) : (
              <UploadCloud size={32} className={isDragging ? 'text-primary-600' : 'text-slate-400'} />
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-lg font-medium text-slate-700">
              {isParsing ? 'Đang phân tích...' : 'Kéo thả file vào đây hoặc click để chọn'}
            </p>
            <p className="text-sm text-slate-500">Hỗ trợ định dạng .DOCX</p>
          </div>
        </div>

        {error && (
          <div className="absolute bottom-4 left-0 w-full text-center">
             <span className="text-red-500 text-sm bg-red-50 px-3 py-1 rounded-full">{error}</span>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start space-x-3">
          <FileType className="text-blue-500 shrink-0" size={20} />
          <div>
            <h4 className="font-semibold text-sm text-slate-800">Cấu trúc chuẩn</h4>
            <p className="text-xs text-slate-500 mt-1">Giữ nguyên định dạng sections và questions.</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start space-x-3">
          <FileType className="text-purple-500 shrink-0" size={20} />
          <div>
            <h4 className="font-semibold text-sm text-slate-800">Nội dung mới</h4>
            <p className="text-xs text-slate-500 mt-1">Câu hỏi được sáng tạo mới hoàn toàn.</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start space-x-3">
           <FileType className="text-green-500 shrink-0" size={20} />
          <div>
            <h4 className="font-semibold text-sm text-slate-800">Tùy biến cao</h4>
            <p className="text-xs text-slate-500 mt-1">Chèn chủ đề và từ vựng của riêng bạn.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
