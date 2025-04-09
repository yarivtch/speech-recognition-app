import { useState, useEffect, useCallback } from 'react';

interface UseSpeechRecognitionReturn {
  text: string;
  isListening: boolean;
  error: string | null;
  hasPermission: boolean | null;
  startListening: () => void;
  stopListening: () => void;
  pauseListening: () => void;
  resumeListening: () => void;
  clearText: () => void;
  setText: (text: string) => void;
  currentSpeaker: number;
  setSpeaker: (id: number) => void;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [text, setText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [currentSpeaker, setCurrentSpeaker] = useState<number>(1);
  const [lastTranscript, setLastTranscript] = useState<string>('');

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('הדפדפן שלך לא תומך בזיהוי דיבור');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();

    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'he-IL';

    let silenceTimeout: NodeJS.Timeout;
    let currentTranscript = lastTranscript;
    
    recognitionInstance.onresult = (event: any) => {
      clearTimeout(silenceTimeout);

      let fullTranscript = '';
      let interimTranscript = '';
      
      // עיבוד כל התוצאות מתחילת ההקלטה
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        let transcript = result[0].transcript.trim();

        // עיבוד סימני פיסוק
        if (result.isFinal) {
          // זיהוי סימני פיסוק מפורשים
          transcript = transcript
            // נקודה
            .replace(/\s+(נקודה|סוף משפט|סיום משפט)\s*/gi, '. ')
            // סימן שאלה
            .replace(/\s+(שאלה|סימן שאלה)\s*/gi, '? ')
            // סימן קריאה
            .replace(/\s+(קריאה|סימן קריאה)\s*/gi, '! ')
            // פסיק
            .replace(/\s+(פסיק|פסיקה)\s*/gi, ', ')
            // נקודתיים
            .replace(/\s+(נקודתיים)\s*/gi, ': ');

          // זיהוי אוטומטי של סימני פיסוק
          transcript = transcript
            // הוספת סימן שאלה למשפטי שאלה
            .replace(/^(מה|איך|למה|מתי|איפה|האם|כמה|מדוע|איזה|מי)\s+([^?]+)$/gi, '$1 $2?')
            // הוספת נקודה בסוף משפט ארוך ללא סימן פיסוק
            .replace(/([^.!?]\s{1,}){5,}([^.!?])$/g, '$1$2.')
            // ניקוי רווחים כפולים
            .replace(/\s+/g, ' ');

          fullTranscript += transcript + ' ';
        } else {
          interimTranscript = transcript;
        }
      }

      // טיפול בטקסט המצטבר
      if (!lastTranscript) {
        // התחלה חדשה
        fullTranscript = `דובר ${currentSpeaker}: ${fullTranscript}`;
      } else {
        // הוספה לטקסט קיים
        fullTranscript = lastTranscript + fullTranscript;
      }

      // זיהוי סיום משפט והחלפת דובר
      if (fullTranscript.match(/[.!?]\s*$/)) {
        silenceTimeout = setTimeout(() => {
          setLastTranscript(fullTranscript + `\n\nדובר ${currentSpeaker}: `);
        }, 1500);
      }

      // עדכון הטקסט
      if (interimTranscript) {
        setText(fullTranscript + interimTranscript);
      } else {
        setLastTranscript(fullTranscript);
        setText(fullTranscript);
      }
    };

    recognitionInstance.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setError('אין הרשאת גישה למיקרופון');
        setHasPermission(false);
      } else {
        setError(`שגיאה בזיהוי דיבור: ${event.error}`);
      }
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setHasPermission(true))
      .catch(() => {
        setHasPermission(false);
        setError('אין הרשאת גישה למיקרופון');
      });

    return () => {
      if (recognition) {
        recognition.stop();
      }
      clearTimeout(silenceTimeout);
    };
  }, [currentSpeaker, lastTranscript]);

  useEffect(() => {
    setText(lastTranscript);
  }, [lastTranscript]);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
        setIsListening(true);
        setIsPaused(false);
        setError(null);
      } catch (err) {
        setError('שגיאה בהפעלת זיהוי דיבור');
        setIsListening(false);
      }
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
      setIsPaused(false);
    }
  }, [recognition, isListening]);

  const pauseListening = useCallback(() => {
    if (recognition && isListening && !isPaused) {
      recognition.stop();
      setIsPaused(true);
      setIsListening(false);
    }
  }, [recognition, isListening, isPaused]);

  const resumeListening = useCallback(() => {
    if (recognition && isPaused) {
      recognition.start();
      setIsPaused(false);
      setIsListening(true);
    }
  }, [recognition, isPaused]);

  const clearText = useCallback(() => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את כל הטקסט?')) {
      setText('');
      setLastTranscript('');
    }
  }, []);

  const setSpeaker = useCallback((id: number) => {
    setCurrentSpeaker(id);
    if (lastTranscript) {
      // הוספת שורה ריקה ושם הדובר החדש
      const newTranscript = lastTranscript.trim() + `\n\nדובר ${id}: `;
      setLastTranscript(newTranscript);
      setText(newTranscript);
    }
  }, [lastTranscript]);

  return {
    text,
    isListening,
    error,
    hasPermission,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
    clearText,
    setText,
    currentSpeaker,
    setSpeaker
  };
}; 