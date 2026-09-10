import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BhoomiMitraService, 
  ChatMessage, 
  ChatAction 
} from '../../services/bhoomiMitraService';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  RotateCcw, 
  IndianRupee, 
  MapPin, 
  FileCheck2, 
  HelpCircle, 
  Download, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Volume2, 
  Globe, 
  Building2, 
  BookOpen, 
  Scale, 
  Clock, 
  ArrowLeft, 
  ChevronRight, 
  Key,
  Headphones,
  PhoneCall,
  AlertTriangle,
  LifeBuoy,
  X
} from 'lucide-react';

export const LandownerAssistantPage: React.FC = () => {
  const { parcels, compensations, documents, projects, currentUser, navigate, showToast } = useApp();

  // Authentication Protection Guard
  React.useEffect(() => {
    if (!currentUser) {
      showToast('Authentication Required', 'Please sign in with your landowner credentials to access BhoomiMitra AI.', 'warning');
      navigate('/login');
    }
  }, [currentUser, navigate, showToast]);

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-md w-full">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center mx-auto">
            <Bot className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-sans">BhoomiMitra AI Assistant</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            The BhoomiMitra AI reasoning engine accesses private acquisition dossiers and is strictly reserved for authenticated citizens.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Sign In to Start Chatting
          </button>
        </div>
      </div>
    );
  }

  const myParcel = parcels.find(p => p.id === 'DL-10293') || parcels[0];
  const myComp = compensations.find(c => c.parcelId === myParcel.id) || compensations[0];
  const myDocs = documents.filter(d => d.parcelId === myParcel.id);
  const myProject = projects.find(p => p.id === myParcel.projectId) || projects[0];

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  const [showLiveSupportModal, setShowLiveSupportModal] = useState(false);
  const [questionTab, setQuestionTab] = useState<'ALL' | 'PRESENTATION' | 'SAMPLE_CITIZEN'>('ALL');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-hub',
      sender: 'assistant',
      text: `Namaste **${myParcel.ownerName}**! 🙏 Welcome to your dedicated **BhoomiMitra AI Assistant Hub**.\n\nI have complete access to your acquisition dossier for **Khasra No. ${myParcel.khasraNumber}** (Village ${myParcel.village}, Project: ${myProject.name}).\n\nHow can I help you today? You can select any of our standard inquiries on **What is BhoomiSetu**, **Why it's important & safe**, **How to navigate**, or request instant help and live escalation for pending compensation.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'GENERAL',
      dataHighlights: [
        { label: 'Khasra Number', value: myParcel.khasraNumber, badge: 'Verified RoR' },
        { label: 'Total Compensation', value: `₹${(myParcel.totalCompensation).toLocaleString('en-IN')}`, badge: '100% Solatium' },
        { label: 'DBT Bank Account', value: `${myComp.bankName} (****4821)` }
      ],
      actions: [
        { label: '1. What is BhoomiSetu?', labelHi: '1. भूमिसेतु क्या है?', actionType: 'QUERY', target: 'What is BhoomiSetu?' },
        { label: '4. How to navigate portal', labelHi: '4. पोर्टल नेविगेट कैसे करें?', actionType: 'QUERY', target: 'How to navigate bhoomisetu?' },
        { label: '6. Delayed Compensation Escalation', labelHi: '6. विलंब मुआवजा एस्केलेशन', actionType: 'QUERY', target: 'Help my compensation for land has not been processed yet. I have not received it since last x months.' }
      ]
    }
  ]);

  // 1. Better off for presentation
  const presentationQuestions = [
    {
      id: 1,
      num: '1',
      q: 'What is BhoomiSetu?',
      qHi: '1. भूमिसेतु क्या है?',
      desc: 'Unified national land acquisition & GIS governance platform under RFCTLARR Act 2013.',
      descHi: 'RFCTLARR अधिनियम 2013 के तहत एकीकृत राष्ट्रीय भूमि अधिग्रहण व GIS शासन प्रणाली।',
      tag: 'Platform Overview',
      tagHi: 'पोर्टल परिचय',
      color: 'amber'
    },
    {
      id: 2,
      num: '2',
      q: 'Why is bhoomiSetu important?',
      qHi: '2. भूमिसेतु क्यों महत्वपूर्ण है?',
      desc: 'Eliminates corrupt middlemen, ensures 100% solatium DBT, and automates statutory milestones.',
      descHi: 'बिचौलियों की समाप्ति, 100% सोलेशियम की कानूनी गारंटी व पारदर्शी समयबद्ध प्रक्रिया।',
      tag: 'Key Value',
      tagHi: 'महत्वपूर्ण लाभ',
      color: 'amber'
    },
    {
      id: 3,
      num: '3',
      q: 'Why is bhoomisetu safe?',
      qHi: '3. भूमिसेतु क्यों सुरक्षित है?',
      desc: 'Aadhaar e-KYC direct authentication, direct PFMS treasury transfer, tamper-proof logs.',
      descHi: 'आधार e-KYC सत्यापन, सीधा ट्रेजरी PFMS बैंक अंतरण, अपरिवर्तनीय डिजिटल ऑडिट ट्रेल।',
      tag: 'Security & Trust',
      tagHi: 'सुरक्षा व विश्वसनीयता',
      color: 'amber'
    }
  ];

  // 2. Better off as sample question
  const citizenSampleQuestions = [
    {
      id: 4,
      num: '4',
      q: 'How to navigate bhoomisetu?',
      qHi: '4. भूमिसेतु को कैसे नेविगेट करें?',
      desc: 'Step-by-step roadmap of Dashboard, Compensation Ledger, Document Vault & AI Console.',
      descHi: 'डैशबोर्ड, मुआवजा लेजर, दस्तावेज वॉल्ट व AI सहायक का चरणबद्ध उपयोग गाइड।',
      tag: 'Navigation Guide',
      tagHi: 'नेविगेशन गाइड',
      color: 'blue'
    },
    {
      id: 5,
      num: '5',
      q: 'Help my compensation for land has not been processed yet.',
      qHi: '5. मदद करें, मेरी भूमि का मुआवजा अभी तक संसाधित नहीं हुआ है।',
      desc: 'Status diagnostic of Section 23 award approval and PFMS bank batch disbursement.',
      descHi: 'धारा 23 अवार्ड स्वीकृति व PFMS बैंक कतार का संपूर्ण वैधानिक निदान।',
      tag: 'Status Diagnostic',
      tagHi: 'मुआवजा निदान',
      color: 'blue'
    },
    {
      id: 6,
      num: '6',
      q: 'Help my compensation for land has not been processed yet. I have not received it since last x months.',
      qHi: '6. मदद करें, मुझे पिछले कई महीनों से मुआवजा नहीं मिला है (कस्टमर केयर व लाइव सपोर्ट)।',
      desc: 'High-priority escalation to Live Customer Care Desk & Section 80 penal interest (9%–15% p.a.).',
      descHi: 'लाइव सहायता अधिकारी व धारा 80 विलंब दंडात्मक ब्याज (9% से 15%) एस्केलेशन।',
      tag: 'Live Escalation',
      tagHi: 'लाइव सपोर्ट एस्केलेशन',
      color: 'red',
      isEscalation: true
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (customText?: string) => {
    const text = customText || inputQuery;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await BhoomiMitraService.queryAssistant(
        text,
        messages,
        language,
        {
          parcel: myParcel,
          compensation: myComp,
          documents: myDocs,
          project: myProject
        }
      );
      setMessages(prev => [...prev, response]);
    } catch (err) {
      console.error('Error querying assistant:', err);
      const fallback = BhoomiMitraService.generateFallbackResponse(text, language, {
        parcel: myParcel,
        compensation: myComp,
        documents: myDocs,
        project: myProject
      });
      setMessages(prev => [...prev, fallback]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: ChatAction) => {
    if (action.actionType === 'NAVIGATE') {
      navigate(action.target);
    } else if (action.actionType === 'MODAL') {
      if (action.target === 'OPEN_LIVE_SUPPORT_MODAL' || action.target === 'CALL_HELPLINE') {
        setShowLiveSupportModal(true);
      } else if (action.target === 'DOWNLOAD_AWARD') {
        showToast(
          'Award Certificate Downloaded',
          `Official Section 23 Award for Khasra ${myParcel.khasraNumber} generated.`,
          'success'
        );
      } else if (action.target === 'OPEN_GRIEVANCE_MODAL') {
        navigate('/landowner/dashboard');
        showToast('Priority Grievance Opened', 'Please complete the pre-filled Section 15/80 SLAO grievance form.', 'info');
      }
    } else if (action.actionType === 'QUERY') {
      handleSend(action.target);
    }
  };

  const handleVoiceSimulate = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    setIsListening(true);
    showToast('Voice Input Activated', 'Listening for audio query...', 'info');

    setTimeout(() => {
      setIsListening(false);
      const randomQ = language === 'HI' 
        ? 'मेरी जमीन का कुल मुआबज़ा और सोलेशियम कितना है?'
        : 'What is the full breakdown of my compensation and solatium?';
      setInputQuery(randomQ);
      handleSend(randomQ);
    }, 2200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0b1f3a] via-slate-900 to-emerald-950 text-white p-6 sm:p-8 rounded-xl shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/landowner/dashboard')}
              className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-emerald-900 text-amber-300 text-xs font-bold uppercase mb-2 border border-emerald-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Citizen Assistance Hub • 24x7 Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-sans flex items-center space-x-2">
                <span>BhoomiMitra AI Land Assistant</span>
                <span className="text-sm font-normal text-slate-300 font-sans">(भूमिमित्र AI)</span>
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200 mt-1">
                Instant statutory answers on fair compensation, Khasra verification, PFMS bank DBT tracking, and legal rights under RFCTLARR Act 2013.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setLanguage(l => l === 'EN' ? 'HI' : 'EN')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'EN' ? 'Switch to हिंदी' : 'Switch to English'}</span>
            </button>

            <button
              onClick={() => {
                setMessages([
                  {
                    id: `welcome-${Date.now()}`,
                    sender: 'assistant',
                    text: language === 'HI' 
                      ? `नमस्ते **${myParcel.ownerName} जी**! मैं भूमिमित्र AI हूँ। आप अपने अधिग्रहित भूखंड से संबंधित कोई भी प्रश्न पूछ सकते हैं।`
                      : `Hello **${myParcel.ownerName}**! I am BhoomiMitra AI. You can ask any question regarding your acquired land holding.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    category: 'GENERAL'
                  }
                ]);
                showToast('Chat Cleared', 'Conversation history reset.', 'info');
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title="Reset Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Landholding Dossier & Quick Question Bank */}
        <div className="space-y-6">
          {/* Landowner Dossier Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>My Active Landholding</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Stage 4: DBT Queue
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 dark:text-slate-400">Citizen / Owner:</span>
                <span className="font-bold text-slate-900 dark:text-white">{myParcel.ownerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 dark:text-slate-400">Khasra Number:</span>
                <span className="font-mono font-bold text-blue-900">{myParcel.khasraNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 dark:text-slate-400">Village / District:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{myParcel.village}, {myParcel.district}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 dark:text-slate-400">Acquired Area:</span>
                <span className="font-bold text-emerald-800">{myParcel.areaAcres} Acres</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 mt-2">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Total Approved Award</span>
                <span className="text-2xl font-black text-emerald-950 font-mono">
                  ₹{(myParcel.totalCompensation).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">
                  Direct Bank Transfer to SBI (****4821)
                </span>
              </div>
            </div>
          </div>

          {/* Official Inquiries & Sample Question Hub */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-blue-700" />
                <span>Sample Inquiries & Guide</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                6 Standard Topics
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 space-x-1 text-xs">
              <button
                type="button"
                onClick={() => setQuestionTab('ALL')}
                className={`flex-1 py-1.5 px-2 rounded-md font-bold text-[11px] transition-all cursor-pointer text-center ${
                  questionTab === 'ALL'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white'
                }`}
              >
                {language === 'HI' ? 'सभी (1-6)' : 'All (1-6)'}
              </button>
              <button
                type="button"
                onClick={() => setQuestionTab('PRESENTATION')}
                className={`flex-1 py-1.5 px-2 rounded-md font-bold text-[11px] transition-all cursor-pointer text-center flex items-center justify-center space-x-1 ${
                  questionTab === 'PRESENTATION'
                    ? 'bg-amber-50 text-amber-900 shadow-xs border border-amber-200'
                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-800'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>{language === 'HI' ? 'प्रस्तुति (1-3)' : 'Overview'}</span>
              </button>
              <button
                type="button"
                onClick={() => setQuestionTab('SAMPLE_CITIZEN')}
                className={`flex-1 py-1.5 px-2 rounded-md font-bold text-[11px] transition-all cursor-pointer text-center flex items-center justify-center space-x-1 ${
                  questionTab === 'SAMPLE_CITIZEN'
                    ? 'bg-blue-50 text-blue-900 shadow-xs border border-blue-200'
                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-800'
                }`}
              >
                <LifeBuoy className="w-3 h-3 text-blue-600" />
                <span>{language === 'HI' ? 'नागरिक (4-6)' : 'Citizen'}</span>
              </button>
            </div>

            {/* Question List */}
            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
              {/* Category A: Presentation Questions */}
              {(questionTab === 'ALL' || questionTab === 'PRESENTATION') && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-[11px] font-bold text-amber-900 uppercase tracking-wider px-1 pt-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>{language === 'HI' ? '🌟 प्रस्तुति व पोर्टल परिचय (Questions 1-3)' : '🌟 Presentation & Overview (Questions 1-3)'}</span>
                  </div>
                  {presentationQuestions.map((qItem) => (
                    <button
                      key={qItem.id}
                      onClick={() => handleSend(language === 'HI' ? qItem.qHi : qItem.q)}
                      className="w-full text-left p-3 rounded-xl bg-amber-50/40 hover:bg-amber-50 border border-amber-200/70 hover:border-amber-400 transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-200 text-amber-950">
                          {qItem.num}. {language === 'HI' ? qItem.tagHi : qItem.tag}
                        </span>
                        <ChevronRight className="w-4 h-4 text-amber-500 group-hover:text-amber-800 shrink-0 ml-1 transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 group-hover:text-amber-950">
                        {language === 'HI' ? qItem.qHi : qItem.q}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        {language === 'HI' ? qItem.descHi : qItem.desc}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {/* Category B: Citizen Sample Questions & Escalation */}
              {(questionTab === 'ALL' || questionTab === 'SAMPLE_CITIZEN') && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center space-x-1.5 text-[11px] font-bold text-blue-900 uppercase tracking-wider px-1 pt-1">
                    <HelpCircle className="w-3 h-3 text-blue-600" />
                    <span>{language === 'HI' ? '💬 नागरिक प्रश्न व एस्केलेशन (Questions 4-6)' : '💬 Citizen Questions & Escalation (Questions 4-6)'}</span>
                  </div>
                  {citizenSampleQuestions.map((qItem) => (
                    <button
                      key={qItem.id}
                      onClick={() => handleSend(language === 'HI' ? qItem.qHi : qItem.q)}
                      className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer group shadow-2xs border ${
                        qItem.isEscalation
                          ? 'bg-red-50/50 hover:bg-red-50 border-red-200 hover:border-red-400'
                          : 'bg-blue-50/40 hover:bg-blue-50 border-blue-200/70 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                          qItem.isEscalation
                            ? 'bg-red-200 text-red-950'
                            : 'bg-blue-200 text-blue-950'
                        }`}>
                          {qItem.num}. {language === 'HI' ? qItem.tagHi : qItem.tag}
                        </span>
                        {qItem.isEscalation ? (
                          <AlertTriangle className="w-4 h-4 text-red-500 group-hover:text-red-700 shrink-0 ml-1" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-blue-500 group-hover:text-blue-800 shrink-0 ml-1 transition-transform group-hover:translate-x-0.5" />
                        )}
                      </div>
                      <h4 className={`text-xs font-bold mt-1.5 ${
                        qItem.isEscalation ? 'text-red-950 font-bold' : 'text-slate-900 dark:text-white group-hover:text-blue-950'
                      }`}>
                        {language === 'HI' ? qItem.qHi : qItem.q}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        {language === 'HI' ? qItem.descHi : qItem.desc}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center/Right 2 Columns: Full AI Interactive Chat Arena */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[700px] overflow-hidden">
          {/* Chat Stream Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-900 to-slate-900 text-amber-400 flex items-center justify-center shadow-xs">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">BhoomiMitra AI Interactive Console</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'HI' ? 'हिंदी व अंग्रेजी दोनों भाषाओं में प्रश्न पूछ सकते हैं' : 'Ask in English, Hindi, or conversational regional terms'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 text-xs text-emerald-700 font-bold px-2 py-1 rounded bg-emerald-100 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>RFCTLARR 2013 Grounded</span>
              </span>
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-800/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-start space-x-3 max-w-[88%]">
                  {msg.sender === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-blue-900 text-amber-400 flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-5 py-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-blue-700 text-white rounded-tr-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {/* Message Body */}
                    <div className="whitespace-pre-line">
                      {msg.text.split('\n').map((line, idx) => {
                        if (line.startsWith('• ') || line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ')) {
                          return (
                            <p key={idx} className="my-1 pl-1 font-medium">
                              {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                            </p>
                          );
                        }
                        return (
                          <p key={idx} className={idx > 0 ? 'mt-2' : ''}>
                            {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                          </p>
                        );
                      })}
                    </div>

                    {/* Highlight Metrics */}
                    {msg.dataHighlights && msg.dataHighlights.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {msg.dataHighlights.map((dh, i) => (
                          <div key={i} className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                            <span className="text-[10px] text-emerald-800 font-bold block uppercase tracking-wider">
                              {dh.label}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono block mt-0.5">
                              {dh.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                        {msg.actions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => handleActionClick(act)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                          >
                            <span>{language === 'HI' ? act.labelHi : act.label}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                          </button>
                        ))}
                      </div>
                    )}

                    <span
                      className={`text-[10px] block mt-2 text-right ${
                        msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-900 text-amber-400 flex items-center justify-center text-xs shrink-0 shadow-xs">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-xs px-5 py-4 shadow-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse delay-100"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse delay-200"></span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 ml-2 font-medium">
                      {language === 'HI' ? 'भूमिमित्र जानकारी संकलित कर रहा है...' : 'BhoomiMitra AI is formulating statutory response...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-3"
            >
              <button
                type="button"
                onClick={handleVoiceSimulate}
                className={`p-3 rounded-full border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white border-red-600 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
                title="Voice Input"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={
                  language === 'HI' 
                    ? 'मुआवजा, DBT भुगतान, 100% सोलेशियम या खसरा 45/12 के बारे में पूछें...' 
                    : 'Ask anything about your compensation calculation, DBT payment, or Khasra 45/12...'
                }
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white dark:bg-slate-900 transition-all"
              />

              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="px-5 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* Live Support & Customer Care Escalation Modal */}
      {showLiveSupportModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-950 via-slate-900 to-blue-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-red-600/30 border border-red-400 flex items-center justify-center text-red-400">
                  <Headphones className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-white">Live Customer Care & SLAO Desk</h3>
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950">
                      ACTIVE NOW
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">National Land Acquisition Grievance Cell</p>
                </div>
              </div>
              <button 
                onClick={() => setShowLiveSupportModal(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs text-slate-700 dark:text-slate-300">
              {/* Statutory Notice Banner */}
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
                <div className="flex items-center space-x-2 text-amber-900 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Section 80 RFCTLARR Act 2013 Statutory Claim</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Your delayed compensation has been registered with <strong>Statutory Delay Penal Interest</strong> (9% p.a. for Year 1, 15% p.a. thereafter). The Competent Authority is notified for immediate hearing.
                </p>
              </div>

              {/* Connected Officer & Token Card */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Escalation Docket ID</span>
                  <span className="text-xs font-black font-mono text-red-700 block mt-0.5">#ESC-2026-DL-9842</span>
                  <span className="text-[10px] text-slate-400 block">SLAO North Delhi</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Assigned Helpdesk Lead</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">Officer Priya Sharma</span>
                  <span className="text-[10px] text-emerald-700 font-semibold block">Citizen Care Executive</span>
                </div>
              </div>

              {/* Contact Channels */}
              <div className="space-y-2.5 pt-1">
                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-800 font-bold uppercase block">National Citizen Toll-Free</span>
                      <span className="text-sm font-black font-mono text-blue-950">1800-180-BHUMI</span>
                      <span className="text-[10px] text-blue-700 block">(1800-180-24864 • Mon-Sat 9AM-6PM)</span>
                    </div>
                  </div>
                  <a
                    href="tel:180018024864"
                    className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Call Now
                  </a>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-800 font-bold uppercase block">Interactive Live Chat</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Chat with Officer Priya Sharma</span>
                      <span className="text-[10px] text-emerald-700 block">Est. Response: Instant in this console</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLiveSupportModal(false);
                      const officerGreeting: ChatMessage = {
                        id: `officer-live-${Date.now()}`,
                        sender: 'assistant',
                        text: `👨‍💼 **Live Agent Connected: Officer Priya Sharma (Citizen Grievance Lead)**\n\n"Namaste Shri **${myParcel.ownerName} Ji**, I am reviewing your delayed compensation file for Khasra **${myParcel.khasraNumber}** (Token: **#ESC-2026-DL-9842**).\n\nI have expedited the Section 80 statutory verification memo to SLAO Shri Rajesh Verma's executive desk. We are ensuring your disbursement batch is prioritized in PFMS. How may I assist you further with your bank details or hearing schedule?"`,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        category: 'ESCALATION',
                        dataHighlights: [
                          { label: 'Live Desk', value: 'Officer Priya Sharma', badge: 'Active Session' },
                          { label: 'Docket Ref', value: '#ESC-2026-DL-9842' },
                          { label: 'Action', value: 'SLAO Memo Dispatched' }
                        ]
                      };
                      setMessages(prev => [...prev, officerGreeting]);
                      showToast('Live Agent Connected', 'Officer Priya Sharma joined the chat session.', 'success');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Start Live Chat
                  </button>
                </div>
              </div>

              {/* Footer SLA */}
              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                  <span>Resolution SLA: 24 - 48 Hours</span>
                </span>
                <span className="text-slate-500 dark:text-slate-400">Ministry of Rural Development</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
