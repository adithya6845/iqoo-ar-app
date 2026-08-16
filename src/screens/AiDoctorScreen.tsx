import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft,
  Mic,
  Bot,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  User,
  MessageSquare,
  CheckSquare,
  Square,
  ChevronRight,
  StopCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { soundManager } from '../utils/sound';
import { askNvidiaAiDoctor, ChatMessage } from '../services/nvidiaAi';

export const AiDoctorScreen: React.FC = () => {
  const { setCurrentScreen, setUserSymptoms } = useApp();
  const scrollViewRef = useRef<any>(null);

  const [inputText, setInputText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [voiceModeActive, setVoiceModeActive] = useState<boolean>(true);

  // Chat Conversation History
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hello, John! I'm your MedTwin AI Health Assistant powered by NVIDIA AI. I can answer any health question, assess symptoms, or guide first aid. How are you feeling today?",
    },
  ]);

  // Diagnostic Checklist
  const [q1Severity, setQ1Severity] = useState('Moderate');
  const [q2Fever, setQ2Fever] = useState(false);
  const [q3Nausea, setQ3Nausea] = useState(false);
  const [q4Sleep, setQ4Sleep] = useState('Poor');

  // Quick Prompt Suggestions
  const quickPrompts = [
    'I have headache and dizziness since morning.',
    'What should I do for a mild burn on my hand?',
    'My heart rate feels fast while resting.',
    'How do I treat a sprained ankle?',
  ];

  // Speak initial greeting on mount
  useEffect(() => {
    soundManager.speak(
      "Hello, John! I'm your MedTwin AI Health Assistant powered by NVIDIA AI. How are you feeling today? Tap the microphone to talk with me."
    );
    setIsSpeaking(true);
    return () => {
      soundManager.stopSpeaking();
    };
  }, []);

  // Send message to NVIDIA AI Doctor
  const handleSendMessage = async (customText?: string) => {
    const query = (customText || inputText).trim();
    if (!query || isLoading) return;

    soundManager.stopSpeaking();
    setIsSpeaking(false);

    const newHistory: ChatMessage[] = [...messages, { role: 'user', content: query }];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const aiReply = await askNvidiaAiDoctor(query, newHistory);
      const updatedMessages: ChatMessage[] = [
        ...newHistory,
        { role: 'assistant', content: aiReply },
      ];
      setMessages(updatedMessages);
      setIsLoading(false);

      // Speak response aloud (like ChatGPT Voice!)
      if (voiceModeActive) {
        setIsSpeaking(true);
        soundManager.speak(aiReply, () => {
          setIsSpeaking(false);
        });
      }

      // Auto scroll to latest message
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    } catch (error) {
      setIsLoading(false);
      const fallbackMsg =
        'I received your query. Please stay hydrated and rest in a quiet space while monitoring your vitals.';
      setMessages([...newHistory, { role: 'assistant', content: fallbackMsg }]);
      soundManager.speak(fallbackMsg);
    }
  };

  // Web Speech Microphone Tap (ChatGPT Voice input)
  const handleVoiceTap = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    soundManager.stopSpeaking();
    setIsSpeaking(false);
    setIsListening(true);

    soundManager.listenSpeech(
      (transcript) => {
        setIsListening(false);
        if (transcript) {
          setInputText(transcript);
          handleSendMessage(transcript);
        }
      },
      () => {
        setIsListening(false);
        soundManager.speak('Could not capture microphone input. Please type below.');
      }
    );
  };

  const handleStopSpeaking = () => {
    soundManager.stopSpeaking();
    setIsSpeaking(false);
  };

  const handleAnalyzeAndSummarize = () => {
    const latestQuery = messages.length > 1 ? messages[messages.length - 2].content : 'Headache and dizziness';
    setUserSymptoms([
      latestQuery,
      `Headache severity: ${q1Severity}`,
      `Fever: ${q2Fever ? 'Yes' : 'No'}`,
      `Nausea/Vomiting: ${q3Nausea ? 'Yes' : 'No'}`,
      `Sleep quality: ${q4Sleep}`,
    ]);
    soundManager.speak('Generating clinical consultation summary and suggested care prescription.');
    setTimeout(() => setCurrentScreen('consultation_summary'), 300);
  };

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setCurrentScreen('home')}>
          <ArrowLeft size={18} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Health Assistant</Text>
          <View style={styles.onlineBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.onlineText}>NVIDIA NIM AI • Online</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setVoiceModeActive(!voiceModeActive)}
        >
          {voiceModeActive ? (
            <Volume2 size={18} color="#0284C7" />
          ) : (
            <VolumeX size={18} color="#94A3B8" />
          )}
        </TouchableOpacity>
      </View>

      {/* Main Conversation & Assistant Feed */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
      >
        {/* Animated AI Doctor Card (ChatGPT Voice Mode) */}
        <View style={styles.doctorHeroCard}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatarCircle, isSpeaking && styles.avatarCircleSpeaking]}>
              <Bot size={36} color="#0284C7" />
            </View>
            <View style={styles.doctorMeta}>
              <Text style={styles.doctorName}>Dr. MedTwin AI</Text>
              <Text style={styles.doctorRole}>Clinical Voice AI Assistant</Text>
              <View style={styles.aiStatusPill}>
                <Sparkles size={11} color="#0284C7" />
                <Text style={styles.aiStatusText}>
                  {isSpeaking
                    ? 'Speaking response...'
                    : isListening
                    ? 'Listening to you...'
                    : 'Ready to assist'}
                </Text>
              </View>
            </View>
          </View>

          {/* Voice Wave Visualizer */}
          <TouchableOpacity
            style={[styles.voiceVisualizerSection, isListening && styles.voiceSectionListening]}
            onPress={handleVoiceTap}
            activeOpacity={0.85}
          >
            <View style={styles.waveRow}>
              <View style={[styles.waveBar, (isSpeaking || isListening) && styles.waveBarActive, { height: isSpeaking ? 22 : 12 }]} />
              <View style={[styles.waveBar, (isSpeaking || isListening) && styles.waveBarActive, { height: isSpeaking ? 30 : 18 }]} />
              <View style={[styles.waveBar, (isSpeaking || isListening) && styles.waveBarActive, { height: isSpeaking ? 36 : 26 }]} />
              <View style={[styles.waveBar, (isSpeaking || isListening) && styles.waveBarActive, { height: isSpeaking ? 28 : 16 }]} />
              <View style={[styles.waveBar, (isSpeaking || isListening) && styles.waveBarActive, { height: isSpeaking ? 18 : 10 }]} />
            </View>

            <View style={[styles.micBigCircle, isListening && { backgroundColor: '#EF4444' }]}>
              <Mic size={24} color="#FFFFFF" />
            </View>

            <Text style={styles.voicePromptSubtext}>
              {isListening
                ? 'Listening... Speak your question now'
                : isSpeaking
                ? 'Speaking answer (Tap to interrupt)'
                : 'Tap to speak with ChatGPT Voice AI'}
            </Text>
          </TouchableOpacity>

          {isSpeaking && (
            <TouchableOpacity style={styles.stopSpeakingBtn} onPress={handleStopSpeaking}>
              <StopCircle size={14} color="#EF4444" />
              <Text style={styles.stopSpeakingText}>Stop Voice</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Question Prompts */}
        <View style={styles.quickPromptsSection}>
          <Text style={styles.quickPromptsTitle}>Quick Health Questions:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptScroll}>
            {quickPrompts.map((prompt, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.promptChip}
                onPress={() => handleSendMessage(prompt)}
              >
                <MessageSquare size={12} color="#0284C7" />
                <Text style={styles.promptChipText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Chat Messages Stream */}
        <View style={styles.messagesContainer}>
          {messages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <View style={styles.msgHeader}>
                {msg.role === 'user' ? (
                  <User size={13} color="#0284C7" />
                ) : (
                  <Bot size={13} color="#16A34A" />
                )}
                <Text style={styles.msgSenderName}>
                  {msg.role === 'user' ? 'You' : 'MedTwin AI Doctor'}
                </Text>
                {msg.role === 'assistant' && (
                  <TouchableOpacity
                    style={styles.msgSpeakerBtn}
                    onPress={() => soundManager.speak(msg.content)}
                  >
                    <Volume2 size={13} color="#0284C7" />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.messageText}>{msg.content}</Text>
            </View>
          ))}

          {isLoading && (
            <View style={[styles.messageBubble, styles.aiBubble, styles.loadingBubble]}>
              <ActivityIndicator size="small" color="#0284C7" />
              <Text style={styles.loadingAiText}>Dr. MedTwin is analyzing...</Text>
            </View>
          )}
        </View>

        {/* Diagnostic Assessment Card */}
        <View style={styles.diagnosticCard}>
          <View style={styles.diagHeader}>
            <Sparkles size={16} color="#0284C7" />
            <Text style={styles.diagTitle}>Symptom Check & Risk Assessment</Text>
          </View>

          <View style={styles.questionBlock}>
            <Text style={styles.qText}>How severe is your headache/symptom?</Text>
            <View style={styles.optionRow}>
              {['Mild', 'Moderate', 'Severe'].map((sev) => (
                <TouchableOpacity
                  key={sev}
                  style={[styles.chipOption, q1Severity === sev && styles.chipActive]}
                  onPress={() => setQ1Severity(sev)}
                >
                  <Text style={[styles.chipText, q1Severity === sev && styles.chipTextActive]}>
                    {sev}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => setQ2Fever(!q2Fever)}>
            {q2Fever ? <CheckSquare size={16} color="#0284C7" /> : <Square size={16} color="#94A3B8" />}
            <Text style={styles.checkboxLabel}>Do you have a fever?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => setQ3Nausea(!q3Nausea)}>
            {q3Nausea ? <CheckSquare size={16} color="#0284C7" /> : <Square size={16} color="#94A3B8" />}
            <Text style={styles.checkboxLabel}>Any vomiting or nausea?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.analyzeBtn} onPress={handleAnalyzeAndSummarize}>
            <Text style={styles.analyzeBtnText}>View Clinical Consultation Summary & Rx</Text>
            <ChevronRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Chat Input Bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity
          style={[styles.inputMicBtn, isListening && styles.inputMicBtnActive]}
          onPress={handleVoiceTap}
        >
          <Mic size={18} color={isListening ? '#FFFFFF' : '#0284C7'} />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Ask a health question or describe symptoms..."
          placeholderTextColor="#94A3B8"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSendMessage()}
          returnKeyType="send"
        />

        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]}
          onPress={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
        >
          <Send size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greenDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16A34A',
  },
  onlineText: {
    color: '#16A34A',
    fontSize: 9,
    fontWeight: '600',
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
    paddingBottom: 20,
  },
  doctorHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    gap: 10,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BAE6FD',
  },
  avatarCircleSpeaking: {
    borderColor: '#0284C7',
    boxShadow: '0 0 14px rgba(2, 132, 199, 0.4)',
  },
  doctorMeta: {
    flex: 1,
    gap: 2,
  },
  doctorName: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  doctorRole: {
    color: '#64748B',
    fontSize: 10,
  },
  aiStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  aiStatusText: {
    color: '#0284C7',
    fontSize: 9,
    fontWeight: '700',
  },
  voiceVisualizerSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  voiceSectionListening: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 38,
  },
  waveBar: {
    width: 4,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  waveBarActive: {
    backgroundColor: '#0284C7',
  },
  micBigCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
  },
  voicePromptSubtext: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  stopSpeakingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stopSpeakingText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '700',
  },
  quickPromptsSection: {
    gap: 6,
  },
  quickPromptsTitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptScroll: {
    gap: 6,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  promptChipText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '500',
  },
  messagesContainer: {
    gap: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  userBubble: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    alignSelf: 'flex-end',
    maxWidth: '88%',
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
    maxWidth: '92%',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
  },
  msgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 2,
  },
  msgSenderName: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    flex: 1,
  },
  msgSpeakerBtn: {
    padding: 2,
  },
  messageText: {
    color: '#0F172A',
    fontSize: 12,
    lineHeight: 16,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingAiText: {
    color: '#0284C7',
    fontSize: 11,
    fontWeight: '600',
  },
  diagnosticCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  diagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  diagTitle: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  questionBlock: {
    gap: 4,
  },
  qText: {
    color: '#334155',
    fontSize: 11,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chipOption: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  chipActive: {
    backgroundColor: '#0284C7',
  },
  chipText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    color: '#334155',
    fontSize: 11,
  },
  analyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 16,
    marginTop: 4,
    boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)',
  },
  analyzeBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  inputMicBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  inputMicBtnActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 12,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
