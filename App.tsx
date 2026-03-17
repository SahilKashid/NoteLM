import React, { useState, useEffect } from 'react';
import { BookOpen, Play, AlertCircle, RotateCcw } from 'lucide-react';
import FileUpload from './components/FileUpload';
import StageProgress from './components/StageProgress';
import NoteDisplay from './components/NoteDisplay';
import { ProcessingStage, NoteState, FileData } from './types';
import { generateStage1, generateStage2, generateStage3 } from './services/geminiService';

const App: React.FC = () => {
  const [noteState, setNoteState] = useState<NoteState>({
    originalText: '',
    files: [],
    stage1Output: '',
    stage2Output: '',
    finalOutput: '',
    status: ProcessingStage.IDLE,
    error: null
  });

  const handleStartProcessing = async () => {
    if (noteState.files.length === 0 && !noteState.originalText.trim()) {
      setNoteState(prev => ({ ...prev, error: "Please upload a file or enter text to begin." }));
      return;
    }

    try {
      // Stage 1
      setNoteState(prev => ({ ...prev, status: ProcessingStage.STAGE_1, error: null, stage1Output: '', stage2Output: '', finalOutput: '' }));
      const stage1 = await generateStage1(noteState.files, noteState.originalText);
      setNoteState(prev => ({ ...prev, stage1Output: stage1 }));

      // Stage 2
      setNoteState(prev => ({ ...prev, status: ProcessingStage.STAGE_2 }));
      const stage2 = await generateStage2(stage1);
      setNoteState(prev => ({ ...prev, stage2Output: stage2 }));

      // Stage 3
      setNoteState(prev => ({ ...prev, status: ProcessingStage.STAGE_3 }));
      const stage3 = await generateStage3(stage2);
      
      // Complete
      setNoteState(prev => ({ ...prev, finalOutput: stage3, status: ProcessingStage.COMPLETED }));

    } catch (err: any) {
      console.error(err);
      setNoteState(prev => ({ 
        ...prev, 
        status: ProcessingStage.ERROR, 
        error: err.message || "An unexpected error occurred during processing." 
      }));
    }
  };

  const handleReset = () => {
    setNoteState({
      originalText: '',
      files: [],
      stage1Output: '',
      stage2Output: '',
      finalOutput: '',
      status: ProcessingStage.IDLE,
      error: null
    });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans selection:bg-white/20">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg border border-white/5">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">NoteLM</h1>
            </div>
          </div>
          {/* Removed Powered by Gemini badge */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        
        {/* Intro */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Mastery, <span className="text-neutral-500">Simplified.</span>
          </h2>
          <p className="text-neutral-400 text-lg md:text-xl font-light leading-relaxed">
            Convert complex documents into structured, mnemonic-enhanced intelligence.
          </p>
        </div>

        {/* Processing Indicator */}
        {noteState.status !== ProcessingStage.IDLE && (
          <StageProgress stage={noteState.status} />
        )}

        {/* Error Message */}
        {noteState.error && (
          <div className="mb-8 p-4 bg-red-950/30 border border-red-900/50 rounded-lg flex items-start gap-3 text-red-200">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
            <p className="text-sm">{noteState.error}</p>
          </div>
        )}

        {/* Split Layout: Input / Output */}
        <div className={`grid gap-8 transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          noteState.status === ProcessingStage.COMPLETED ? 'lg:grid-cols-12' : 'grid-cols-1 max-w-3xl mx-auto'
        }`}>
          
          {/* Left Column: Input */}
          <div className={`space-y-6 ${
            noteState.status === ProcessingStage.COMPLETED ? 'lg:col-span-4' : 'w-full'
          }`}>
            <div className="bg-neutral-900/50 backdrop-blur-sm p-1 rounded-2xl border border-white/10 shadow-2xl shadow-black/50">
              <div className="bg-black/40 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-medium text-white text-sm uppercase tracking-wider">Input Source</h3>
                  {noteState.status === ProcessingStage.COMPLETED && (
                    <button 
                      onClick={handleReset}
                      className="text-xs flex items-center gap-1.5 text-neutral-500 hover:text-white transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                  )}
                </div>
                
                <FileUpload 
                  files={noteState.files}
                  onFilesSelected={(newFiles) => setNoteState(prev => ({ ...prev, files: [...prev.files, ...newFiles] }))}
                  onRemoveFile={(idx) => setNoteState(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== idx) }))}
                  text={noteState.originalText}
                  onTextChange={(text) => setNoteState(prev => ({ ...prev, originalText: text }))}
                  disabled={noteState.status !== ProcessingStage.IDLE && noteState.status !== ProcessingStage.COMPLETED && noteState.status !== ProcessingStage.ERROR}
                />

                {(noteState.status === ProcessingStage.IDLE || noteState.status === ProcessingStage.ERROR) && (
                  <button
                    onClick={handleStartProcessing}
                    className="w-full mt-6 bg-white hover:bg-neutral-200 text-black font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-white/5 active:scale-[0.98]"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    Generate Notes
                  </button>
                )}
              </div>
            </div>

            {/* If processing status */}
            {(noteState.status !== ProcessingStage.IDLE && noteState.status !== ProcessingStage.COMPLETED && noteState.status !== ProcessingStage.ERROR) && (
               <div className="p-6 rounded-xl border border-white/5 bg-white/5 text-center">
                 <div className="inline-block w-2 h-2 rounded-full bg-blue-500 mb-3 animate-ping"></div>
                 <p className="text-neutral-300 font-medium">Synthesizing...</p>
                 <p className="text-neutral-500 text-xs mt-2 uppercase tracking-widest">AI Processing</p>
               </div>
            )}
          </div>

          {/* Right Column: Output */}
          {noteState.status === ProcessingStage.COMPLETED && (
            <div className="lg:col-span-8 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-forwards">
              <NoteDisplay content={noteState.finalOutput} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;