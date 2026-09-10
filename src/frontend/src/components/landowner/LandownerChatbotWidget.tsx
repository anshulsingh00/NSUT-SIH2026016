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
  X, 
  Minus, 
  Maximize2, 
  Minimize2,
  ChevronUp, 
  Key, 
  IndianRupee, 
  MapPin, 
  FileCheck2, 
  HelpCircle, 
  Download, 
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  Globe,
  Headphones,
  PhoneCall,
  AlertTriangle,
  LifeBuoy,
  Clock,
  Compass,
  BookOpen
} from 'lucide-react';

interface LandownerChatbotWidgetProps {
  initialOpen?: boolean;
  onOpenGrievance?: () => void;
}

export const LandownerChatbotWidget: React.FC<LandownerChatbotWidgetProps> = ({ 
  initialOpen = false,
  onOpenGrievance
}) => {
  const { parcels, compensations, documents, projects, currentRole, currentUser, navigate, showToast } = useApp();

  // STRICT AUTH GATING: Chatbot is accessible ONLY when authenticated as Landowner
  if (!currentUser || currentUser.role !== 'LANDOWNER') {
    return null;
  }

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showLiveSupportModal, setShowLiveSupportModal] = useState(false);
  const [activePromptTab, setActivePromptTab] = useState<'PRESENTATION' | 'SAMPLE_QUERIES' | 'LAND_DBT'>('PRESENTATION');
  const [customApiKey, setCustomApiKey] = useState(BhoomiMitraService.getStoredApiKey());
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const myParcel = parcels.find(p => p.id === 'DL-10293') || parcels[0];
  const myComp = compensations.find(c => c.parcelId === myParcel.id) || compensations[0];
  const myDocs = documents.filter(d => d.parcelId === myParcel.id);
  const myProject = projects.find(p => p.id === myParcel.projectId) || projects[0];

  const TRANSLATIONS: Record<'EN' | 'HI', Record<string, string>> = {
    EN: {
      welcome_msg: `Namaste **{{ownerName}}**! 🙏 I am **BhoomiMitra AI**, your official Landowner & Citizen Assistant on the BhoomiSetu Platform.\n\nI can answer questions regarding **What is BhoomiSetu**, **Why it's important & safe**, or assist with your **Khasra No. {{khasraNumber}}** (Village {{village}}), compensation breakdown, and payment escalation.`,
      cleared_msg: `Hello **{{ownerName}}**! I am BhoomiMitra AI. You can ask me anything about your compensation, DBT payment, or Khasra record.`,
      officer_msg: `👨‍💼 **Live Agent Connected: Officer Priya Sharma (Citizen Grievance Lead)**\n\n"Namaste Shri **{{ownerName}} Ji**, I am reviewing your delayed compensation file for Khasra **{{khasraNumber}}** (Token: **#ESC-2026-DL-9842**).\n\nI have expedited the Section 80 statutory verification memo to SLAO Shri Rajesh Verma's executive desk. We are ensuring your disbursement batch is prioritized in PFMS. How may I assist you further with your bank details or hearing schedule?"`,
      
      query_what_is: `What is BhoomiSetu?`,
      bot_what_is: `🏛️ **What is BhoomiSetu (भूमिसेतु)?**\n\n**BhoomiSetu** is India's next-generation, unified digital governance platform for Land Acquisition, GIS Cadastral Demarcation, and Direct Benefit Transfer (DBT) management, engineered in strict compliance with the **RFCTLARR Act, 2013** (Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act).\n\n**Core Pillars of BhoomiSetu:**\n1. **Citizen & Landowner Empowerment:** Provides farmers and property owners with instant, 100% transparent visibility into land valuation, statutory 100% solatium, and direct bank payouts.\n2. **GIS Cadastral Layering:** Integrates high-precision satellite & drone demarcation directly with revenue survey boundaries to eliminate boundary disputes.\n3. **AI Document Intelligence:** Automates extraction and verification of 7/12 Jamabandi, Khatauni RoRs, and Aadhaar e-KYC.\n4. **Zero-Intermediary DBT:** Disburses statutory compensation straight from the National Treasury (PFMS) into the landowner's verified bank account without middlemen.`,

      query_why_important: `Why is bhoomiSetu important?`,
      bot_why_important: `🌟 **Why is BhoomiSetu Important?**\n\nHistorically, public land acquisition in India was hindered by multi-year procedural bottlenecks, revenue record tampering, and opaque physical compensation files. BhoomiSetu transforms this paradigm:\n\n1. **Zero Middlemen & Full Transparency:** Direct electronic disbursements eliminate commissions, leakages, and touts by wiring compensation directly through the Public Financial Management System (PFMS).\n2. **Mandatory 100% Solatium Guarantee:** Enforces Section 30(1) of RFCTLARR Act 2013, doubling the base market valuation automatically with statutory 100% solatium.\n3. **Automated Statutory Timelines:** Tracks every regulatory milestone (Section 3A notification, Section 3D declaration, Section 23 award) with automated bottleneck alerts.\n4. **Dispute-Free GIS Demarcation:** Satellite-ground synced cadastral overlays guarantee accurate land extent without overlapping claims.\n5. **Empowered Citizen Redressal:** Built-in Section 15(1) statutory objection filing and expedited grievance handling directly with District Collectors.`,

      query_why_safe: `Why is bhoomisetu safe?`,
      bot_why_safe: `🛡️ **Why is BhoomiSetu Safe?**\n\nBhoomiSetu is built on sovereign-grade enterprise security and statutory compliance standards:\n\n1. **Aadhaar e-KYC & DigiLocker Verification:** Direct biometric and OTP-backed authentication ensures only genuine landowners can view and manage compensation claims.\n2. **PFMS Direct Treasury Transfer:** Funds move directly from the Government of India Consolidated Fund/PFMS into your authenticated bank account (SBI ****4821)—no escrow hold-ups or third-party handling.\n3. **Cryptographic Audit Trails:** Every parcel demarcation, circle rate calculation, and SLAO approval is immutably timestamped and digitally signed.\n4. **Statutory RFCTLARR Legal Protection:** Full compliance with Section 30(1) (100% Solatium), Section 96 (Tax Exemption), and Section 80 (9%–15% statutory penal interest on delay).\n5. **Bank-Grade Data Encryption:** End-to-end 256-bit encryption safeguards your land title deeds, passbooks, and personal records.`,

      query_navigate: `How to navigate bhoomisetu?`,
      bot_navigate: `🧭 **How to Navigate BhoomiSetu (Platform Walkthrough)**\n\nBhoomiSetu is organized into intuitive, single-window citizen sections:\n\n1. 📊 **Landowner Dashboard (/landowner/dashboard):** View your complete landholding dossier, Khasra **45/12/1**, 2.40 Acres area, and total approved **₹88.90 Lakh** statutory award.\n2. 💰 **Compensation & Payment Ledger (/landowner/payments):** Inspect the exact breakdown of base circle rate, 100% solatium, asset valuation, and live PFMS bank transfer stages.\n3. 📁 **Digital Document Vault (/landowner/documents):** View verified 7/12 Jamabandi RoRs, check Aadhaar e-KYC status, and upload bank passbooks or co-sharer affidavits.\n4. 🤖 **BhoomiMitra AI Assistant (/landowner/assistant):** 24x7 voice & text interactive guidance in English and Hindi for statutory inquiries.\n5. ⚖️ **Grievance Redressal & Live Support:** File Section 15(1) objections or escalate delayed compensation directly to the Special Land Acquisition Officer (SLAO).`,

      query_help_comp: `Help my compensation for land has not been processed yet.`,
      bot_help_comp: `Hello **{{ownerName}}**, here is the exact diagnostic audit for your compensation on **Parcel DL-10293** (Khasra No. **{{khasraNumber}}**, Village {{village}}):\n\n• **Total Statutory Award:** **₹88,90,000** (Base Value ₹43,20,000 + 100% Solatium ₹43,20,000 + Assets ₹2,50,000)\n• **Approval Status:** Formally sanctioned under **Section 23 Award** by SLAO North Delhi.\n• **Current Stage:** The payment file is in the automated **PFMS (Public Financial Management System)** disbursement queue for direct electronic credit to your **State Bank of India A/C ending ****4821** (IFSC: SBIN0001234).\n\n**Actionable Checklist:**\n1. Ensure your bank account has active NPCI Aadhaar seeding.\n2. Normal PFMS batch settlement takes **3–5 business days**.\n3. If already delayed past expectations, you can escalate immediately or view the detailed ledger below.`,

      query_help_escalate: `Help my compensation for land has not been processed yet. I have not received it since last x months.`,
      bot_help_escalate: `🚨 **HIGH PRIORITY CITIZEN ESCALATION & LIVE CARE PROTOCOL** 🚨\n\nHello **{{ownerName}}**, we understand your compensation has experienced an unacceptable multi-month delay. Your case has been immediately flagged and escalated to the **National Landowner Grievance Cell & Live Customer Care Desk**.\n\n⚖️ **Statutory Protection under Section 80 of RFCTLARR Act 2013:**\n• **Mandatory Statutory Interest:** If compensation is not paid within the mandated timeline upon taking possession, the acquiring authority is statutorily liable to pay interest **@ 9% per annum** for the first year, and **@ 15% per annum** for subsequent delayed months until full realization.\n• **Priority Escalation Token:** **#ESC-2026-DL-9842** (Direct SLAO North Delhi Docket)\n• **Competent Authority:** **Shri Rajesh Verma, IAS** (Special Land Acquisition Officer)\n• **Assigned Live Desk Lead:** **Officer Priya Sharma** (Citizen Assistance Cell)\n\nPlease click below to immediately connect with a **Live Support Specialist** or dial our toll-free direct line.`,
    },
    HI: {
      welcome_msg: `नमस्ते **{{ownerName}} जी**! 🙏 मैं **भूमिमित्र AI** हूँ — भूमिसेतु पोर्टल पर आपका आधिकारिक भूमि व नागरिक सहायक।\n\nआप मुझसे **भूमिसेतु क्या है**, **यह क्यों महत्वपूर्ण व सुरक्षित है**, या अपने **खसरा नंबर {{khasraNumber}}** (ग्राम {{village}}), मुआवजे की स्थिति व शिकायत एस्केलेशन के बारे में पूछ सकते हैं।`,
      cleared_msg: `नमस्ते श्री **{{ownerName}} जी**! मैं भूमिमित्र AI हूँ। आप मुझसे अपने मुआवजे, DBT भुगतान व खसरा विवरण के बारे में पूछ सकते हैं।`,
      officer_msg: `👨‍💼 **लाइव एजेंट कनेक्टेड: अधिकारी प्रिया शर्मा (नागरिक शिकायत प्रमुख)**\n\n"नमस्ते श्री **{{ownerName}} जी**, मैं खसरा **{{khasraNumber}}** के आपके विलंबित मुआवजे की फाइल की समीक्षा कर रही हूँ (टोकन: **#ESC-2026-DL-9842**)।\n\nमैंने SLAO श्री राजेश वर्मा के कार्यकारी डेस्क को धारा 80 वैधानिक सत्यापन मेमो भेज दिया है। हम PFMS में आपके भुगतान बैच को प्राथमिकता देना सुनिश्चित कर रहे हैं। मैं आपके बैंक विवरण या सुनवाई कार्यक्रम के संबंध में आगे कैसे सहायता कर सकती हूँ?"`,

      query_what_is: `भूमिसेतु क्या है?`,
      bot_what_is: `🏛️ **भूमिसेतु (BhoomiSetu) क्या है?**\n\n**भूमिसेतु** भारत सरकार के **RFCTLARR अधिनियम, 2013** (उचित प्रतिकर और पारदर्शिता का अधिकार) के तहत विकसित एक एकीकृत, पारदर्शी राष्ट्रीय भूमि अधिग्रहण, मूल्यांकन एवं DBT प्रबंधन डिजिटल प्लेटफॉर्म है।\n\n**भूमिसेतु के मुख्य स्तंभ:**\n1. **नागरिक एवं किसान सशक्तिकरण:** किसानों को 100% सोलेशियम, सर्कल रेट और बैंक खाते में सीधे DBT भुगतान की पारदर्शी जानकारी प्रदान करता है।\n2. **GIS सैटेलाइट कैडस्ट्रल मैपिंग:** जमीन के खसरा नंबरों और सीमांकन का सैटेलाइट व ड्रोन सर्वे द्वारा डिजिटल सत्यापन, जिससे सीमाओं पर कोई विवाद न रहे।\n3. **AI दस्तावेज बुद्धिमत्ता:** 7/12 जमाबंदी, खतौनी व राजस्व रिकॉर्ड का स्वतः OCR सत्यापन।\n4. **मध्यस्थों की समाप्ति:** ट्रेजरी (PFMS) से सीधे किसान के आधार-लिंक्ड बैंक खाते में 100% सुरक्षित भुगतान।`,

      query_why_important: `यह क्यों महत्वपूर्ण है?`,
      bot_why_important: `🌟 **भूमिसेतु क्यों महत्वपूर्ण है? (Why is BhoomiSetu Important?)**\n\nपारंपरिक भूमि अधिग्रहण में दशकों तक चलने वाले विलंब, बिचौलियों के भ्रष्टाचार और कागजी अस्पष्टता की समस्या रहती थी। भूमिसेतु निम्नलिखित कारणों से अत्यंत महत्वपूर्ण व क्रांतिकारी है:\n\n1. **भ्रष्टाचार व बिचौलियों का अंत:** मुआवजा राशि सीधे PFMS के माध्यम से किसान के बैंक खाते में जमा होती है, जिससे किसी तीसरे पक्ष की गुंजाइश नहीं रहती।\n2. **100% सोलेशियम की कानूनी गारंटी:** RFCTLARR अधिनियम की धारा 30(1) के तहत मूल भूमि मूल्य के बराबर 100% अतिरिक्त वैधानिक सोलेशियम सुनिश्चित किया जाता है।\n3. **समयबद्ध वैधानिक प्रक्रिया:** धारा 3A, 3D अधिसूचना और धारा 23 अवार्ड के प्रत्येक चरण की रियल-टाइम SLA ट्रैकिंग होती है।\n4. **विवाद-मुक्त सीमांकन:** GIS सैटेलाइट कोऑर्डिनेट्स से जमीन के रकबे का सटीक सत्यापन होता है, जिससे सीमा विवाद समाप्त होते हैं।\n5. **त्वरित शिकायत निवारण:** धारा 15(1) के तहत SLAO को सीधे आपत्ति दर्ज कराने और 7-15 दिनों में समाधान की सुविधा।`,

      query_why_safe: `भूमिसेतु क्यों सुरक्षित है?`,
      bot_why_safe: `🛡️ **भूमिसेतु क्यों सुरक्षित है? (Why is BhoomiSetu Safe?)**\n\nभूमिसेतु को भारत सरकार के कड़े साइबर सुरक्षा व डिजिटल गवर्नेंस मानकों पर तैयार किया गया है:\n\n1. **आधार e-KYC व डिजिलॉकर प्रमाणीकरण:** केवल सत्यापित भूस्वामी ही अपने भूखंड और मुआवजे तक पहुंच सकते हैं।\n2. **सीधा ट्रेजरी बैंक अंतरण (PFMS DBT):** राशि किसी निजी खाते या मध्यस्थ एजेंसी में नहीं जाती, बल्कि सीधे राष्ट्रीय कोष से आपके बैंक खाते (SBI ****4821) में ट्रांसफर होती है।\n3. **अपरिवर्तनीय ऑडिट ट्रेल (Immutable Logs):** भूमि सीमांकन, सर्कल रेट और अनुमोदन के प्रत्येक चरण का डिजिटल टाइमस्टैम्प सुरक्षित रहता है, जिससे कोई अनधिकृत बदलाव संभव नहीं है।\n4. **RFCTLARR 2013 वैधानिक सुरक्षा:** धारा 80 के तहत भुगतान में देरी होने पर 9% से 15% वार्षिक ब्याज पाने का कानूनी अधिकार।\n5. **डेटा एन्क्रिप्शन:** सभी व्यक्तिगत दस्तावेज 256-बिट बैंक-ग्रेड एन्क्रिप्शन से सुरक्षित हैं।`,

      query_navigate: `नेविगेट कैसे करें?`,
      bot_navigate: `🧭 **भूमिसेतु को कैसे नेविगेट करें? (Step-by-Step Navigation Guide)**\n\nभूमिसेतु पोर्टल को सरल एवं सहज बनाया गया है। आप मुख्य रूप से इन 5 अनुभागों का उपयोग कर सकते हैं:\n\n1. 📊 **डैशबोर्ड (Dashboard):** आपके भूखंड (खसरा 45/12/1), रकबा (2.40 एकड़), स्वीकृत ₹88.90 लाख मुआवजे और परियोजना की समग्र स्थिति।\n2. 💰 **मुआवजा लेजर (Payment Status):** मूल भूमि मूल्य, 100% सोलेशियम, पेड़/नलकूप मूल्यांकन और PFMS DBT बैंक ट्रांसफर की लाइव ट्रैकिंग।\n3. 📁 **दस्तावेज वॉल्ट (Documents):** सत्यापित 7/12 जमाबंदी, e-KYC स्थिति, बैंक पासबुक और सह-खातेदार शपथ पत्र अपलोड करने की सुविधा।\n4. 🤖 **भूमिमित्र AI सहायक (BhoomiMitra AI):** 24x7 हिंदी व अंग्रेजी में बोलकर या लिखकर किसी भी सवाल का तुरंत जवाब पाएं।\n5. ⚖️ **शिकायत व आपत्ति (Grievance Redressal):** धारा 15(1) के तहत SLAO को आपत्ति दर्ज करें या देरी होने पर लाइव कस्टमर केयर से संपर्क करें।`,

      query_help_comp: `मुआवजा प्रोसेस नहीं हुआ`,
      bot_help_comp: `नमस्ते **श्री {{ownerName}} जी**, आपके खसरा नंबर **{{khasraNumber}}** (ग्राम: {{village}}) के मुआवजे की स्थिति का पूर्ण निदान (Status Diagnosis):\n\n• **स्वीकृत अवार्ड राशि:** **₹88,90,000** (मूल भूमि मूल्य ₹43,20,000 + 100% वैधानिक सोलेशियम ₹43,20,000 + संपत्ति ₹2,50,000)\n• **सत्यापन स्थिति:** विशेष भूमि अधिग्रहण अधिकारी (SLAO) द्वारा **धारा 23 अवार्ड पूर्ण रूप से स्वीकृत** हो चुका है।\n• **वर्तमान चरण:** भुगतान वाउचर PFMS (सार्वजनिक वित्तीय प्रबंधन प्रणाली) के डिजिटल सिग्नेचर टोकन बैच में है, जो सीधे आपके **SBI बैंक खाते (****4821)** में अंतरित किया जाएगा।\n\n**आपके लिए त्वरित कदम:**\n1. सुनिश्चित करें कि आपका बैंक खाता आधार से लिंक (NPCI e-KYC) है।\n2. यदि आपको 3-5 कार्य दिवसों में बैंक SMS प्राप्त न हो, तो नीचे दिए गए बटन से लेजर जांचें या सीधे SLAO को इंक्वायरी भेजें।`,

      query_help_escalate: `X महीनों से नहीं मिला (लाइव केयर)`,
      bot_help_escalate: `🚨 **अति-प्राथमिकता शिकायत निवारण एवं लाइव सपोर्ट एस्केलेशन** 🚨\n\nनमस्ते **श्री {{ownerName}} जी**, यदि आपको कई महीनों से भूमि अधिग्रहण का मुआवजा प्राप्त नहीं हुआ है, तो यह मामला सीधे **सक्षम प्राधिकारी व नागरिक सहायता केंद्र (Customer Care Desk)** को प्राथमिकता के आधार पर भेजा जा रहा है।\n\n⚖️ **RFCTLARR अधिनियम 2013 की धारा 80 के तहत आपका वैधानिक अधिकार:**\n• यदि कब्जा लेने की तिथि से मुआवजे के भुगतान में वैधानिक अवधि से अधिक का विलंब होता है, तो सरकार पहले वर्ष के लिए **9% वार्षिक ब्याज** तथा उसके बाद के विलंब पर **15% वार्षिक दंडात्मक ब्याज** का भुगतान करने के लिए कानूनन बाध्य है।\n• आपका एस्केलेशन टोकन: **#ESC-2026-DL-9842** (सक्रिय)\n• विशेष भूमि अधिग्रहण अधिकारी (SLAO): **श्री राजेश वर्मा, IAS** (उत्तरी दिल्ली कलक्ट्रेट)\n• नोडल हेल्पलाइन डेस्क: **सुश्री प्रिया शर्मा (वरिष्ठ सहायता अधिकारी)**\n\nआप अभी नीचे दिए गए बटनों द्वारा लाइव सहायता अधिकारी से जुड़ सकते हैं या सीधे 1800 टोल-फ्री नंबर पर कॉल कर सकते हैं।`,
    }
  };

  const QUERY_TO_KEY_MAP: Record<string, string> = {
    'What is BhoomiSetu?': 'what_is',
    'Why is bhoomiSetu important?': 'why_important',
    'Why is bhoomisetu safe?': 'why_safe',
    'How to navigate bhoomisetu?': 'navigate',
    'Help my compensation for land has not been processed yet.': 'help_comp',
    'Help my compensation for land has not been processed yet. I have not received it since last x months.': 'help_escalate',
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome-1',
        sender: 'assistant',
        text: '',
        textKey: 'welcome_msg',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'GENERAL',
        dataHighlights: [
          { label: 'Parcel ID', value: myParcel?.id || 'DL-10293', badge: 'Verified RoR' },
          { label: 'Total Award', value: `₹${(myParcel?.totalCompensation || 8890000).toLocaleString('en-IN')}` },
          { label: 'Helpline Desk', value: '1800-180-BHUMI' }
        ],
        actions: [
          { label: '1. What is BhoomiSetu?', labelHi: '1. भूमिसेतु क्या है?', actionType: 'QUERY', target: 'What is BhoomiSetu?' },
          { label: '2. Why is BhoomiSetu safe?', labelHi: '2. भूमिसेतु क्यों सुरक्षित है?', actionType: 'QUERY', target: 'Why is bhoomisetu safe?' },
          { label: '3. Delayed Payment Escalation', labelHi: '3. विलंब भुगतान एस्केलेशन', actionType: 'QUERY', target: 'Help my compensation for land has not been processed yet. I have not received it since last x months.' }
        ]
      }
    ];
  });

  // Categorized Sample Questions
  const presentationPrompts = [
    { label: '1. What is BhoomiSetu?', labelHi: '1. भूमिसेतु क्या है?', query: 'What is BhoomiSetu?' },
    { label: '2. Why is BhoomiSetu important?', labelHi: '2. यह क्यों महत्वपूर्ण है?', query: 'Why is bhoomiSetu important?' },
    { label: '3. Why is BhoomiSetu safe?', labelHi: '3. यह क्यों सुरक्षित है?', query: 'Why is bhoomisetu safe?' }
  ];

  const citizenSamplePrompts = [
    { label: '4. How to navigate BhoomiSetu?', labelHi: '4. नेविगेट कैसे करें?', query: 'How to navigate bhoomisetu?' },
    { label: '5. Help: Compensation not processed yet', labelHi: '5. मुआवजा प्रोसेस नहीं हुआ', query: 'Help my compensation for land has not been processed yet.' },
    { label: '6. Help: Not received since X months (Escalate)', labelHi: '6. X महीनों से नहीं मिला (लाइव केयर)', query: 'Help my compensation for land has not been processed yet. I have not received it since last x months.' }
  ];

  const landDbtPrompts = [
    { label: '💰 My Compensation Breakdown', labelHi: '💰 मेरा मुआवजा', query: 'How is my compensation calculated for Khasra 45/12?' },
    { label: '🏦 PFMS DBT Status', labelHi: '🏦 DBT भुगतान स्थिति', query: 'When will DBT payment be credited to my SBI account?' },
    { label: '📍 Khasra 45/12 Status', labelHi: '📍 खसरा 45/12 स्थिति', query: 'What is the status of my Khasra 45/12 in Narela?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const keyPrefix = QUERY_TO_KEY_MAP[textToSend.trim()];

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      textKey: keyPrefix ? `query_${keyPrefix}` : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await BhoomiMitraService.queryAssistant(
        textToSend,
        messages,
        language,
        {
          parcel: myParcel,
          compensation: myComp,
          documents: myDocs,
          project: myProject
        }
      );

      if (keyPrefix) {
        response.textKey = `bot_${keyPrefix}`;
      }

      setMessages(prev => [...prev, response]);

      if (!isOpen || isMinimized) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to get bot response:', err);
      const fallback = BhoomiMitraService.generateFallbackResponse(textToSend, language, {
        parcel: myParcel,
        compensation: myComp,
        documents: myDocs,
        project: myProject
      });
      if (keyPrefix) {
        fallback.textKey = `bot_${keyPrefix}`;
      }
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
      } else if (action.target === 'OPEN_GRIEVANCE_MODAL') {
        if (onOpenGrievance) {
          onOpenGrievance();
        } else {
          navigate('/landowner/dashboard');
          showToast('Priority Grievance Opened', 'Please review the pre-filled Section 15/80 SLAO grievance docket.', 'info');
        }
      } else if (action.target === 'DOWNLOAD_AWARD') {
        showToast(
          'Award Certificate Downloaded',
          `Official Section 23 Award for Khasra ${myParcel.khasraNumber} generated.`,
          'success'
        );
      }
    } else if (action.actionType === 'QUERY') {
      handleSendQuery(action.target);
    }
  };

  const handleVoiceInputSimulate = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    showToast('BhoomiMitra Voice Query Active', 'Listening for speech input...', 'info');

    // Simulate voice speech recognition
    setTimeout(() => {
      setIsListening(false);
      const sampleVoiceQueries = language === 'HI' ? [
        'मेरी जमीन का मुआवजा कब मिलेगा?',
        'खसरा नंबर 45/12 की वर्तमान स्थिति क्या है?',
        'क्या 100% सोलेशियम की राशि मिल रही है?'
      ] : [
        'When will my compensation be credited to my SBI account?',
        'Explain the 100% solatium calculation under RFCTLARR Act',
        'What is the status of Khasra No 45/12 in Narela?'
      ];
      const randomQuery = sampleVoiceQueries[Math.floor(Math.random() * sampleVoiceQueries.length)];
      setInputQuery(randomQuery);
      handleSendQuery(randomQuery);
    }, 2400);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: '',
        textKey: 'cleared_msg',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'GENERAL'
      }
    ]);
    showToast('Chat Cleared', 'Conversation history has been reset.', 'info');
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    BhoomiMitraService.setStoredApiKey(customApiKey);
    setShowKeyModal(false);
    showToast(
      customApiKey.trim() ? 'Gemini API Key Saved' : 'Gemini Key Reset',
      customApiKey.trim() ? 'BhoomiMitra AI will now use Gemini 2.5 Flash live reasoning.' : 'Reverted to offline statutory knowledge engine.',
      'success'
    );
  };

  return (
    <>
      {/* Floating Trigger Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center group">
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              setUnreadCount(0);
            }}
            className="relative flex items-center space-x-2.5 px-4 py-3 bg-gradient-to-r from-emerald-700 via-teal-700 to-blue-800 hover:from-emerald-600 hover:to-blue-700 text-white rounded-full shadow-xl hover:shadow-2xl border-2 border-amber-300 transition-all duration-300 transform hover:scale-105 cursor-pointer"
            aria-label="Open BhoomiMitra AI Chatbot"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900/20 backdrop-blur-xs flex items-center justify-center text-amber-300">
                <Bot className="w-5 h-5 animate-bounce" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
            </div>

            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold flex items-center space-x-1">
                <span>BhoomiMitra AI</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-black">24x7</span>
              </div>
              <div className="text-[10px] text-emerald-200">
                {language === 'HI' ? 'भूमिमित्र सहायता' : 'Landowner Assistant'}
              </div>
            </div>

            {unreadCount > 0 && (
              <span className="absolute -top-2 -left-2 bg-red-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full border-2 border-white shadow-md">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Main Chatbot Window */}
      {isOpen && (
        <div 
          className={`fixed z-50 transition-all duration-300 ease-in-out ${
            isMinimized 
              ? 'bottom-5 right-5 w-72 sm:w-80 h-14' 
              : isExpanded
                ? 'bottom-2 right-2 sm:bottom-4 sm:right-4 w-[calc(100vw-1rem)] sm:w-[94vw] max-w-5xl h-[92vh]'
                : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[580px] md:w-[660px] lg:w-[720px] h-[750px] max-h-[92vh]'
          } bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-700 flex flex-col overflow-hidden`}
        >
          {/* Top Header Bar */}
          <div className="bg-gradient-to-r from-[#0b1f3a] via-slate-900 to-emerald-950 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center font-bold shadow-md">
                  <Bot className="w-5 h-5 text-slate-900 dark:text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold tracking-tight font-sans text-white">
                    BhoomiMitra AI
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    RFCTLARR Act 2013
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 flex items-center space-x-1">
                  <span>{language === 'HI' ? 'भूमिमित्र — किसान एवं नागरिक सहायता सहायक' : 'Official Citizen Land Acquisition Virtual Assistant'}</span>
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center space-x-1.5 text-slate-300">
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(l => l === 'EN' ? 'HI' : 'EN')}
                className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-[11px] font-bold text-amber-300 border border-slate-700 transition-colors cursor-pointer"
                title="Toggle English / हिंदी"
              >
                {language === 'EN' ? 'हिंदी' : 'EN'}
              </button>

              {/* API Key Modal Trigger */}
              <button
                onClick={() => setShowKeyModal(true)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                title="Configure Gemini API Key"
              >
                <Key className="w-4 h-4" />
              </button>

              {/* Reset / Clear */}
              <button
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Clear Chat History"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Maximize / Restore Toggle */}
              <button
                onClick={() => {
                  setIsExpanded(!isExpanded);
                  setIsMinimized(false);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={isExpanded ? 'Restore Normal Window' : 'Maximize Full Window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Minimize */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              </button>

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-red-900/40 text-slate-300 hover:text-red-400 transition-colors cursor-pointer"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Context Banner */}
              <div className="bg-emerald-50/90 dark:bg-emerald-900/30 border-b border-emerald-100 dark:border-emerald-800/50 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-emerald-950 dark:text-emerald-100 shrink-0">
                <div className="flex items-center space-x-1.5 truncate">
                  <MapPin className="w-3 h-3 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">
                    <strong>Khasra {myParcel.khasraNumber}</strong> ({myParcel.village}) • Entitlement: <strong className="font-mono text-emerald-800 dark:text-emerald-400">₹{(myParcel.totalCompensation).toLocaleString('en-IN')}</strong>
                  </span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-200/70 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-300 shrink-0 border border-transparent dark:border-emerald-700/50">
                  Sec 23 Award
                </span>
              </div>

              {/* Prompt Category Tabs & Chips Bar */}
              <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 shrink-0">
                {/* Category Filter Tabs */}
                <div className="px-3 pt-2 pb-1 flex items-center space-x-1 border-b border-slate-200 dark:border-slate-800/60 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setActivePromptTab('PRESENTATION')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
                      activePromptTab === 'PRESENTATION'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-500" />
                    <span>{language === 'HI' ? '🌟 प्रस्तुति प्रश्न (1-3)' : '🌟 Presentation (Q1-3)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePromptTab('SAMPLE_QUERIES')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
                      activePromptTab === 'SAMPLE_QUERIES'
                        ? 'bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <HelpCircle className="w-2.5 h-2.5 text-blue-600 dark:text-blue-500" />
                    <span>{language === 'HI' ? '💬 नागरिक प्रश्न (4-6)' : '💬 Citizen Queries (Q4-6)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePromptTab('LAND_DBT')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
                      activePromptTab === 'LAND_DBT'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <IndianRupee className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-500" />
                    <span>{language === 'HI' ? '📊 मुआवजा व DBT' : '📊 Land & DBT'}</span>
                  </button>
                </div>

                {/* Question Chips */}
                <div className="px-3 py-2 flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-xs">
                  {activePromptTab === 'PRESENTATION' && presentationPrompts.map((qp, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendQuery(qp.query)}
                      className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-slate-800 dark:text-slate-200 hover:text-amber-950 dark:hover:text-amber-300 border border-amber-200/80 dark:border-amber-700/50 hover:border-amber-400 dark:hover:border-amber-500 font-semibold text-[11px] shadow-2xs transition-all cursor-pointer flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>{language === 'HI' ? qp.labelHi : qp.label}</span>
                    </button>
                  ))}

                  {activePromptTab === 'SAMPLE_QUERIES' && citizenSamplePrompts.map((qp, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendQuery(qp.query)}
                      className={`whitespace-nowrap px-2.5 py-1 rounded-full text-slate-800 dark:text-slate-200 font-semibold text-[11px] shadow-2xs transition-all cursor-pointer flex items-center space-x-1 border ${
                        idx === 2 
                          ? 'bg-red-50 hover:bg-red-100 text-red-900 border-red-300 hover:border-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 dark:border-red-800/50 dark:hover:border-red-500/50' 
                          : 'bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-950 dark:hover:text-blue-300 border-blue-200 dark:border-blue-700/50 hover:border-blue-400 dark:hover:border-blue-500/50'
                      }`}
                    >
                      {idx === 2 ? (
                        <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400 shrink-0" />
                      ) : (
                        <HelpCircle className="w-3 h-3 text-blue-500 dark:text-blue-400 shrink-0" />
                      )}
                      <span>{language === 'HI' ? qp.labelHi : qp.label}</span>
                    </button>
                  ))}

                  {activePromptTab === 'LAND_DBT' && landDbtPrompts.map((qp, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendQuery(qp.query)}
                      className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-700 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50 hover:border-emerald-400 dark:hover:border-emerald-500/50 font-semibold text-[11px] shadow-2xs transition-all cursor-pointer"
                    >
                      {language === 'HI' ? qp.labelHi : qp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-800/50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-start space-x-2 max-w-[92%]">
                      {msg.sender === 'assistant' && (
                        <div className="w-7 h-7 rounded-full bg-blue-900 text-amber-400 flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`rounded-2xl px-4.5 py-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-xs'
                        }`}
                      >
                        {/* Message Text with simple formatting support */}
                        <div className="whitespace-pre-line">
                          {(() => {
                            let rawText = msg.textKey && TRANSLATIONS[language][msg.textKey] 
                              ? TRANSLATIONS[language][msg.textKey] 
                              : msg.text;
                            
                            // Replace dynamic variables
                            rawText = rawText
                              .replace(/{{ownerName}}/g, myParcel?.ownerName || 'Citizen')
                              .replace(/{{khasraNumber}}/g, myParcel?.khasraNumber || '45/12/1')
                              .replace(/{{village}}/g, myParcel?.village || 'Narela');

                            return rawText.split('\n').map((line, idx) => {
                              if (line.startsWith('• ') || line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ')) {
                                return (
                                  <p key={idx} className="my-1.5 pl-1">
                                    {line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                                  </p>
                                );
                              }
                              return (
                                <p key={idx} className={idx > 0 ? 'mt-2' : ''}>
                                  {line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                                </p>
                              );
                            }).map((el, i) => (
                              <React.Fragment key={i}>
                                {typeof el.props.children === 'string' ? (
                                  <span dangerouslySetInnerHTML={{ __html: el.props.children }} className={el.props.className} />
                                ) : (
                                  <p className={el.props.className} dangerouslySetInnerHTML={{ __html: el.props.children.join('') }} />
                                )}
                              </React.Fragment>
                            ))
                          })()}
                        </div>

                        {/* Data Highlight Cards */}
                        {msg.dataHighlights && msg.dataHighlights.length > 0 && (
                          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-700/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {msg.dataHighlights.map((dh, i) => (
                              <div key={i} className="p-2.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200/80 dark:border-emerald-800/50">
                                <span className="text-[11px] text-emerald-800 dark:text-emerald-400 font-bold block">
                                  {dh.label}
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono block mt-0.5">
                                  {dh.value}
                                </span>
                                {dh.badge && (
                                  <span className="inline-block mt-1 text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-200 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-300 border border-transparent dark:border-emerald-800">
                                    {dh.badge}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action Buttons */}
                        {msg.actions && msg.actions.length > 0 && (
                          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap gap-2">
                            {msg.actions.map((act, i) => (
                              <button
                                key={i}
                                onClick={() => handleActionClick(act)}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
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

                {/* Loading Bubble */}
                {isLoading && (
                  <div className="flex items-start space-x-2">
                    <div className="w-7 h-7 rounded-full bg-blue-900 text-amber-400 flex items-center justify-center text-xs shrink-0 shadow-xs">
                      <Bot className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-xs px-4.5 py-3.5 shadow-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse delay-100"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse delay-200"></span>
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium ml-1">
                          {language === 'HI' ? 'भूमिमित्र जानकारी खोज रहा है...' : 'BhoomiMitra is searching statutory records...'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Input Form */}
              <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendQuery();
                  }}
                  className="flex items-center space-x-2.5"
                >
                  {/* Voice Button */}
                  <button
                    type="button"
                    onClick={handleVoiceInputSimulate}
                    className={`p-3 rounded-full border transition-all cursor-pointer ${
                      isListening
                        ? 'bg-red-500 text-white border-red-600 animate-pulse'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                    title={isListening ? 'Listening... click to stop' : 'Voice Input (Hindi/English)'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Text Input */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder={
                      language === 'HI'
                        ? 'मुआवजा, DBT भुगतान, 100% सोलेशियम या पोर्टल नेविगेशन के बारे में पूछें...'
                        : 'Ask anything about compensation, PFMS DBT timeline, 100% solatium...'
                    }
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputQuery.trim() || isLoading}
                    className="px-4.5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer disabled:cursor-not-allowed flex items-center space-x-1.5"
                  >
                    <span>Send</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-2">
                  <span>RFCTLARR Act 2013 Statutory Knowledge</span>
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>DigiLocker & PFMS Grounded</span>
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Gemini API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
                <Key className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm">Gemini AI Configuration</h3>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              BhoomiMitra AI functions seamlessly using its built-in RFCTLARR knowledge base. If you have a Google Gemini API key, you can enter it below to enable live reasoning via <strong>Gemini 2.5 Flash</strong>.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={e => setCustomApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 bg-transparent dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomApiKey('');
                    BhoomiMitraService.setStoredApiKey('');
                    setShowKeyModal(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors"
                >
                  Clear Key
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs"
                >
                  Save & Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
              <div className="p-3.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/50 space-y-1.5">
                <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-400 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-500 shrink-0" />
                  <span>Section 80 RFCTLARR Act 2013 Protection</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300/80 leading-relaxed">
                  Your case has been docketed under <strong>Statutory Delay Penal Interest</strong> (9% p.a. for Year 1, 15% p.a. thereafter). The Competent Authority is notified for immediate hearing.
                </p>
              </div>

              {/* Connected Officer & Token Card */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Escalation Docket ID</span>
                  <span className="text-xs font-black font-mono text-red-700 dark:text-red-400 block mt-0.5">#ESC-2026-DL-9842</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">SLAO North Delhi</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Assigned Helpdesk Lead</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">Officer Priya Sharma</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block">Citizen Care Executive</span>
                </div>
              </div>

              {/* Contact Channels */}
              <div className="space-y-2.5 pt-1">
                <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-800 dark:text-blue-400 font-bold uppercase block">National Citizen Toll-Free</span>
                      <span className="text-sm font-black font-mono text-blue-950 dark:text-blue-100">1800-180-BHUMI</span>
                      <span className="text-[10px] text-blue-700 dark:text-blue-300/80 block">(1800-180-24864 • Mon-Sat 9AM-6PM)</span>
                    </div>
                  </div>
                  <a
                    href="tel:180018024864"
                    className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Call Now
                  </a>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold uppercase block">Interactive Live Chat</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Chat with Officer Priya Sharma</span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400/80 block">Est. Response: Instant in this window</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLiveSupportModal(false);
                      const officerGreeting: ChatMessage = {
                        id: `officer-live-${Date.now()}`,
                        sender: 'assistant',
                        text: '',
                        textKey: 'officer_msg',
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
              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
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
    </>
  );
};
