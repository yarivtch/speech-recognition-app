import React, { useState } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.ts';

export const SpeechRecognitionDemo: React.FC = () => {
  const {
    text,
    isListening,
    error,
    hasPermission,
    startListening,
    stopListening,
    clearText,
    setText,
    currentSpeaker,
    setSpeaker,
    compatibility,
  } = useSpeechRecognition();

  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);

  const speakers = [1, 2, 3, 4]; // מספרי הדוברים האפשריים

  const handleEdit = () => {
    setIsEditing(true);
    setEditedText(text);
  };

  const handleSave = () => {
    setText(editedText);
    setIsEditing(false);
  };

  // הוספת הודעת תאימות
  const renderCompatibilityMessage = () => {
    if (!compatibility.isCompatible) {
      return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 max-w-md text-center text-white border border-white/20">
            <h2 className="text-2xl font-bold mb-4">תאימות דפדפן</h2>
            <p className="mb-6">{error}</p>
            {compatibility.isMobile && !compatibility.isChrome && (
              <a 
                href={`intent://speech-recognition-app#Intent;scheme=https;package=com.android.chrome;end`}
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-colors duration-200"
              >
                פתח ב-Chrome
              </a>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {renderCompatibilityMessage()}
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-10 border border-white/20">
          <div className="max-w-2xl mx-auto">
            {/* כותרת */}
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-white">
              זיהוי דיבור חכם
            </h1>

            {/* סטטוס הרשאות */}
            <div className="mb-8">
              <div className="flex items-center gap-3 justify-center bg-white/5 backdrop-blur py-3 px-6 rounded-2xl border border-white/10">
                <div className="relative">
                  <span className={`block h-3 w-3 rounded-full ${
                    hasPermission === null ? 'bg-gray-400' :
                    hasPermission ? 'bg-emerald-500' : 'bg-red-500'
                  }`}>
                    {hasPermission && <span className="absolute inset-0 rounded-full animate-ping bg-emerald-500/50"></span>}
                  </span>
                </div>
                <span className="text-sm font-medium text-white/90">
                  {hasPermission === null ? 'בודק הרשאות...' :
                   hasPermission ? 'יש הרשאת מיקרופון' : 'אין הרשאת מיקרופון'}
                </span>
              </div>
            </div>

            {/* כפתורי שליטה */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <button
                onClick={startListening}
                disabled={!hasPermission || isListening}
                className={`relative group px-6 py-4 rounded-2xl transition-all duration-300 
                  ${!hasPermission || isListening
                    ? 'bg-gray-500/30 cursor-not-allowed'
                    : 'bg-emerald-500/80 hover:bg-emerald-500 hover:scale-105'
                  } backdrop-blur-sm`}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/50 to-teal-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center gap-3 text-white font-semibold">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  התחל האזנה
                </span>
              </button>

              <button
                onClick={stopListening}
                disabled={!isListening}
                className={`relative group px-6 py-4 rounded-2xl transition-all duration-300 
                  ${!isListening
                    ? 'bg-gray-500/30 cursor-not-allowed'
                    : 'bg-red-500/80 hover:bg-red-500 hover:scale-105'
                  } backdrop-blur-sm`}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/50 to-pink-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center gap-3 text-white font-semibold">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  עצור האזנה
                </span>
              </button>

              <button
                onClick={clearText}
                disabled={!text}
                className={`relative group px-6 py-4 rounded-2xl transition-all duration-300 
                  ${!text
                    ? 'bg-gray-500/30 cursor-not-allowed'
                    : 'bg-indigo-500/80 hover:bg-indigo-500 hover:scale-105'
                  } backdrop-blur-sm`}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center gap-3 text-white font-semibold">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  נקה טקסט
                </span>
              </button>
            </div>

            {/* אינדיקציה למצב האזנה */}
            {isListening && (
              <div className="mb-6 bg-emerald-500/10 backdrop-blur rounded-2xl p-4 border border-emerald-500/20">
                <div className="flex items-center justify-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                    <div className="relative h-3 w-3 bg-emerald-500 rounded-full"></div>
                  </div>
                  <span className="text-emerald-500 font-medium">מקליט...</span>
                </div>
              </div>
            )}

            {/* הודעות שגיאה */}
            {error && (
              <div className="mb-6 bg-red-500/10 backdrop-blur rounded-2xl p-4 border border-red-500/20">
                <div className="flex items-center gap-3 text-red-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* תצוגת טקסט */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-white/20">
              {isEditing ? (
                <div className="p-6">
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    dir="rtl"
                    className="w-full h-[200px] p-4 bg-white/5 rounded-xl border border-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/10 outline-none transition-all duration-200 text-white resize-none"
                    placeholder="הטקסט המזוהה יופיע כאן..."
                  />
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
                    >
                      ביטול
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 rounded-xl bg-indigo-500/80 text-white hover:bg-indigo-500 transition-all duration-200"
                    >
                      שמור
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 relative group">
                  <button
                    onClick={handleEdit}
                    className="absolute top-4 left-4 p-2 text-white/50 hover:text-white transition-colors duration-200 opacity-0 group-hover:opacity-100"
                    title="ערוך טקסט"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <p dir="rtl" className="whitespace-pre-wrap min-h-[200px] text-white/90 text-lg">
                    {text || 'הטקסט המזוהה יופיע כאן...'}
                  </p>
                </div>
              )}
            </div>

            {/* כפתור בחירת דובר לפני כפתורי השליטה */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-4">
                <span className="text-white/90">בחר דובר:</span>
                <div className="flex gap-2">
                  {speakers.map((id) => (
                    <button
                      key={id}
                      onClick={() => setSpeaker(id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                        ${currentSpeaker === id 
                          ? 'bg-indigo-500 text-white' 
                          : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 