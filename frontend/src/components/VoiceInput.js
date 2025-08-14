import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceInput = ({ onResult, onError, className }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [volume, setVolume] = useState(0);
  
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        startVolumeMonitoring();
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            setConfidence(result[0].confidence);
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);

        if (finalTranscript) {
          onResult(finalTranscript, result[0].confidence);
          stopListening();
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        onError && onError(event.error);
        stopListening();
      };

      recognitionRef.current.onend = () => {
        stopListening();
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopVolumeMonitoring();
    };
  }, [onResult, onError]);

  const startVolumeMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      microphoneRef.current.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateVolume = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setVolume(average / 255);
        
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      
      updateVolume();
    } catch (error) {
      console.error('Failed to access microphone:', error);
    }
  };

  const stopVolumeMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setVolume(0);
  };

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) {
      onError && onError('Speech recognition not supported');
      return;
    }

    setTranscript('');
    setConfidence(0);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    stopVolumeMonitoring();
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className={`voice-input-unsupported ${className}`}>
        <Button disabled variant="outline" size="sm">
          <MicOff className="w-4 h-4 mr-2" />
          Voice not supported
        </Button>
      </div>
    );
  }

  return (
    <div className={`voice-input ${className}`}>
      <motion.div className="voice-controls">
        <Button
          onClick={toggleListening}
          variant={isListening ? "destructive" : "outline"}
          size="lg"
          className="voice-button"
        >
          <motion.div
            animate={{
              scale: isListening ? [1, 1.2, 1] : 1,
              rotate: isListening ? [0, 5, -5, 0] : 0
            }}
            transition={{
              duration: 0.5,
              repeat: isListening ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            {isListening ? (
              <MicOff className="w-5 h-5 mr-2" />
            ) : (
              <Mic className="w-5 h-5 mr-2" />
            )}
          </motion.div>
          {isListening ? 'Stop Recording' : 'Start Voice Input'}
        </Button>

        {/* Volume indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="volume-indicator"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              <div className="volume-bar">
                <motion.div
                  className="volume-level"
                  animate={{ width: `${volume * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Live transcript */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="live-transcript"
          >
            <div className="transcript-content">
              {transcript ? (
                <>
                  <p className="transcript-text">{transcript}</p>
                  {confidence > 0 && (
                    <div className="confidence-indicator">
                      <span className="confidence-label">Confidence:</span>
                      <div className="confidence-bar">
                        <motion.div
                          className="confidence-level"
                          animate={{ width: `${confidence * 100}%` }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                      </div>
                      <span className="confidence-value">{Math.round(confidence * 100)}%</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="listening-indicator">
                  <motion.div
                    className="listening-dots"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span>Listening</span>
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                    >.</motion.span>
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                    >.</motion.span>
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
                    >.</motion.span>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual feedback - sound waves */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sound-waves"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="sound-wave"
                animate={{
                  scaleY: [1, 1 + volume * 2, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInput;