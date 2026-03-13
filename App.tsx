import React, { useState, useCallback } from 'react';
import { ExamConfig, AppStep } from './types';
import { generateExamContent } from './services/geminiService';
import { StepIndicator } from './components/StepIndicator';
import { SetupPage } from './components/SetupPage';
import { ResultDisplay } from './components/ResultDisplay';
import { Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.SETUP);
  const [config, setConfig] = useState<ExamConfig>({
    sampleText: '',
    fileName: '',
    topics: '',
    vocabulary: '',
    grammar: '',
  });
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (finalConfig: ExamConfig) => {
    setConfig(finalConfig);
    setCurrentStep(AppStep.GENERATING);
    setError(null);

    try {
      const generatedContent = await generateExamContent(finalConfig);
      setResult(generatedContent);
      setCurrentStep(AppStep.RESULT);
    } catch (err) {
      console.error(err);
      setError("Đã xảy ra lỗi khi tạo đề thi. Vui lòng kiểm tra API Key hoặc thử lại sau.");
      setCurrentStep(AppStep.SETUP);
    }
  }, []);

  const handleReset = () => {
    // Keep config but clear result? Or clear all? 
    // Usually user wants to generate again with slightly different config.
    // Let's keep config.
    setResult('');
    setError(null);
    setCurrentStep(AppStep.SETUP);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentStep(AppStep.SETUP)}>
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <Sparkles className="text-white h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">
              ExamGen AI
            </h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Powered by Gemini 2.5
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8">
        <StepIndicator currentStep={currentStep} />

        <div className="transition-all duration-500 ease-in-out">
          {currentStep === AppStep.SETUP && (
            <SetupPage 
              initialConfig={config} 
              onSubmit={handleGenerate} 
            />
          )}

          {currentStep === AppStep.GENERATING && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-2xl mx-auto">
              <div className="relative w-28 h-28 mb-8">
                <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <Sparkles className="text-primary-500 animate-pulse" size={40} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Đang khởi tạo đề thi...</h3>
              <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                AI đang phân tích cấu trúc <strong>{config.fileName}</strong> và xây dựng câu hỏi mới.<br/>
                <span className="text-sm text-slate-500">Quá trình này có thể mất tới 60 giây. Vui lòng không tắt trình duyệt.</span>
              </p>
              
              <div className="w-64 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full animate-progress origin-left"></div>
              </div>
              <style>{`
                @keyframes progress {
                  0% { width: 0%; }
                  30% { width: 40%; }
                  70% { width: 80%; }
                  100% { width: 95%; }
                }
                .animate-progress {
                  animation: progress 20s ease-out forwards;
                }
              `}</style>
            </div>
          )}

          {currentStep === AppStep.RESULT && (
            <ResultDisplay content={result} onReset={handleReset} />
          )}
          
          {error && currentStep === AppStep.SETUP && (
            <div className="max-w-4xl mx-auto mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center shadow-sm">
              <span className="mr-3 text-2xl">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} ExamGen AI. Designed for Teachers & Learners.
        </div>
      </footer>
    </div>
  );
};

export default App;