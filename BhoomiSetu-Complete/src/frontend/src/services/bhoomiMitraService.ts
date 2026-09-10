import { GoogleGenAI } from '@google/genai';
import { LandParcel, CompensationRecord, DocumentItem, Project } from '../types';

export interface ChatAction {
  label: string;
  labelHi: string;
  actionType: 'NAVIGATE' | 'MODAL' | 'QUERY';
  target: string;
  icon?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  textHi?: string;
  textKey?: string;
  timestamp: string;
  category?: 'COMPENSATION' | 'PARCEL' | 'DBT' | 'DOCUMENTS' | 'GRIEVANCE' | 'LEGAL' | 'GENERAL' | 'PLATFORM' | 'SAFETY' | 'NAVIGATION' | 'ESCALATION';
  actions?: ChatAction[];
  dataHighlights?: {
    label: string;
    value: string;
    badge?: string;
  }[];
}

// System instructions for Gemini AI Landowner Assistant
const SYSTEM_PROMPT = `
You are "BhoomiMitra AI" (भूमिमित्र AI), an empathetic, highly knowledgeable, and authoritative official Landowner Virtual Assistant on the BhoomiSetu (भूमिसेतु) National Land Acquisition Platform developed for the Government of India.

Your primary duty is to help Indian landowners, farmers, and citizens whose land is being acquired under the "Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013" (RFCTLARR Act 2013).

Current Logged-in Landowner Context:
- Owner Name: Raj Kumar (S/o Shri Hariram Kumar)
- Land Parcel ID: DL-10293
- Khasra Number: 45/12/1
- Khatauni Number: 108/42
- Village / District: Narela, North Delhi, Delhi
- Project Name: Delhi–Meerut Connectivity Corridor (NHAI / PWD Project PRJ-001)
- Acquired Area: 2.40 Acres (Agricultural)
- Base Circle Rate: ₹18,00,000 / Acre
- Base Land Value: ₹43,20,000
- Statutory 100% Solatium (Sec 30(1)): +₹43,20,000
- Additional Asset Valuation (Trees, Tube-well, boundary): +₹2,50,000
- Total Statutory Compensation: ₹88,90,000 (Rupees Eighty-Eight Lakh Ninety Thousand Only)
- Compensation Status: Approved under Section 23 Award; in final PFMS bank disbursement queue to State Bank of India A/C ending ****4821 (IFSC: SBIN0001234).
- Special Land Acquisition Officer (SLAO): Shri Rajesh Verma, IAS, North Delhi Collectorate.
- National Citizen Helpline: 1800-180-BHUMI (1800-180-24864)
- Live Helpdesk Desk: Officer Priya Sharma, Citizen Redressal Cell

Special Knowledge Base for Key Inquiries:
1. What is BhoomiSetu?
   - India's unified National Land Acquisition, Valuation, and DBT Management Platform under RFCTLARR Act 2013.
   - Connects Landowners, Revenue Authorities (SLAO/Collectors), and Implementing Agencies (NHAI, Railways, PWD).
   - Features: GIS cadastral overlay, AI revenue document OCR, 100% Solatium enforcement, direct PFMS bank transfer, and zero TDS on agricultural land (Section 96).

2. Why is BhoomiSetu important?
   - Eliminates multi-year bureaucratic delays and corrupt middlemen.
   - Guarantees 100% solatium compensation directly into bank accounts.
   - Digital GIS demarcation prevents fraudulent boundary claims and land disputes.
   - Enforces statutory timelines for 3A, 3D, and Section 23 award declarations.

3. Why is BhoomiSetu safe?
   - Aadhaar e-KYC & DigiLocker direct authentication.
   - Zero middlemen: Direct Benefit Transfer (DBT) straight from Public Financial Management System (PFMS) to citizen bank accounts.
   - Immutable audit trails with cryptographic timestamps for every survey, approval, and transaction.
   - Full statutory legal backing under RFCTLARR Act 2013 with Section 80 delayed interest protection.

4. How to navigate BhoomiSetu?
   - Dashboard: Complete landholding dossier, Khasra 45/12 summary, project roadmap.
   - Compensation Ledger: Detailed breakdown of circle rate, 100% solatium, asset valuation, and PFMS transaction tokens.
   - Document Vault: 7/12 Jamabandi RoR, e-KYC status, bank passbook upload, and co-sharer affidavits.
   - BhoomiMitra AI Assistant: 24x7 bilingual conversational AI and voice assistant.
   - Grievance & SLAO Objections: File Section 15(1) objections and track resolution tokens within 7-15 days.

5. Help - My compensation has not been processed yet:
   - Diagnostic: Explain that Section 23 Award is approved for Khasra 45/12/1 (₹88,90,000) and is currently queued in PFMS for direct RTGS credit to SBI A/C ending in ****4821. Provide steps to verify bank mandate and contact SLAO if needed.

6. Help - My compensation has not been received since last X months (Customer Care / Live Agent Escalation):
   - Escalate immediately to Customer Care / Live Officer.
   - Explain Section 80 of RFCTLARR Act 2013: Mandatory 9% per annum interest for the 1st year of delay, and 15% per annum interest for subsequent delayed periods.
   - Issue Priority Escalation Token #ESC-2026-DL-9842 and connect user to Live Support / Toll-Free Helpline (1800-180-BHUMI).

Tone & Behavior Guidelines:
1. Be respectful, crystal clear, reassuring, and completely transparent with numbers and timelines.
2. If the user asks in Hindi or Hinglish, reply in Hindi (Devanagari script) or bilingual format. If asked in English, reply in English.
3. Always explain the legal protections of RFCTLARR Act 2013.
4. Provide structured, readable answers with bullet points, bold highlights, and clear escalation tokens.
5. Guide the user toward appropriate actions (e.g., uploading documents, tracking DBT, escalating to live support).
`;

export class BhoomiMitraService {
  private static apiKeyStorageKey = 'bhoomi_gemini_api_key';

  public static getStoredApiKey(): string {
    return localStorage.getItem(this.apiKeyStorageKey) || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  }

  public static setStoredApiKey(key: string): void {
    if (key.trim()) {
      localStorage.setItem(this.apiKeyStorageKey, key.trim());
    } else {
      localStorage.removeItem(this.apiKeyStorageKey);
    }
  }

  /**
   * Generates response using Gemini API if key is available,
   * otherwise seamlessly falls back to the rich built-in statutory knowledge engine.
   */
  public static async queryAssistant(
    userQuery: string,
    history: ChatMessage[],
    language: 'EN' | 'HI',
    context: {
      parcel?: LandParcel;
      compensation?: CompensationRecord;
      documents?: DocumentItem[];
      project?: Project;
    }
  ): Promise<ChatMessage> {
    const apiKey = this.getStoredApiKey();

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        
        // Build conversation prompt
        const promptWithContext = `
${SYSTEM_PROMPT}

Language Requested: ${language === 'HI' ? 'Hindi (हिंदी)' : 'English'}
User Query: "${userQuery}"

Provide a concise, helpful, and reassuring response tailored to the query. Keep it clear, polite, and informative.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptWithContext,
        });

        const textResponse = response.text || '';
        if (textResponse.trim()) {
          const fallbackData = this.generateFallbackResponse(userQuery, language, context);
          return {
            id: `msg-${Date.now()}`,
            sender: 'assistant',
            text: textResponse,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            category: fallbackData.category,
            actions: fallbackData.actions,
            dataHighlights: fallbackData.dataHighlights
          };
        }
      } catch (err) {
        console.warn('Gemini API call failed, using built-in knowledge base:', err);
      }
    }

    // Built-in Domain Knowledge Engine (100% reliable offline fallback)
    return this.generateFallbackResponse(userQuery, language, context);
  }

  /**
   * Built-in intelligent rule & semantic responder for Landowner queries
   */
  public static generateFallbackResponse(
    query: string,
    language: 'EN' | 'HI',
    context: {
      parcel?: LandParcel;
      compensation?: CompensationRecord;
      documents?: DocumentItem[];
      project?: Project;
    }
  ): ChatMessage {
    const q = query.toLowerCase().trim();
    const isHindi = language === 'HI' || /[\u0900-\u097F]/.test(query);

    const parcel = context.parcel || {
      id: 'DL-10293',
      ownerName: 'Raj Kumar',
      fatherName: 'Hariram Kumar',
      khasraNumber: '45/12/1',
      khatauniNumber: '108/42',
      village: 'Narela',
      district: 'North Delhi',
      areaAcres: 2.40,
      landType: 'Agricultural' as const,
      circleRatePerAcre: 1800000,
      marketValueTotal: 4320000,
      solatiumAmount: 4320000,
      additionalAssetValue: 250000,
      totalCompensation: 8890000,
      status: 'In Progress' as const,
      projectName: 'Delhi–Meerut Connectivity Corridor'
    };

    const comp = context.compensation || {
      bankName: 'State Bank of India',
      bankAccountMasked: '****4821',
      ifscCode: 'SBIN0001234',
      status: 'Approved',
      awardNotificationNo: 'LAC/ND/2026/AW-8821'
    };

    // =========================================================================
    // 6. DELAYED COMPENSATION FOR MONTHS -> ESCALATION TO CUSTOMER CARE / LIVE CHAT (Question 6)
    // =========================================================================
    if (
      (q.includes('month') || q.includes('saal') || q.includes('year') || q.includes('mahine') || q.includes('महीने') || q.includes('महीनों') || q.includes('delaye') || q.includes('delay') || q.includes('x months') || q.includes('last') || q.includes('escalat') || q.includes('customer care') || q.includes('live chat') || q.includes('live person') || q.includes('agent') || q.includes('human') || q.includes('helpline') || q.includes('call')) &&
      (q.includes('compensation') || q.includes('process') || q.includes('receive') || q.includes('payment') || q.includes('money') || q.includes('muavza') || q.includes('मुआवजा') || q.includes('भुगतान') || q.includes('पैसा') || q.includes('help') || q.includes('मदद'))
    ) {
      if (isHindi) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: `🚨 **अति-प्राथमिकता शिकायत निवारण एवं लाइव सपोर्ट एस्केलेशन** 🚨\n\nनमस्ते **श्री ${parcel.ownerName} जी**, यदि आपको कई महीनों से भूमि अधिग्रहण का मुआवजा प्राप्त नहीं हुआ है, तो यह मामला सीधे **सक्षम प्राधिकारी व नागरिक सहायता केंद्र (Customer Care Desk)** को प्राथमिकता के आधार पर भेजा जा रहा है।\n\n⚖️ **RFCTLARR अधिनियम 2013 की धारा 80 के तहत आपका वैधानिक अधिकार:**\n• यदि कब्जा लेने की तिथि से मुआवजे के भुगतान में वैधानिक अवधि से अधिक का विलंब होता है, तो सरकार पहले वर्ष के लिए **9% वार्षिक ब्याज** तथा उसके बाद के विलंब पर **15% वार्षिक दंडात्मक ब्याज** का भुगतान करने के लिए कानूनन बाध्य है।\n• आपका एस्केलेशन टोकन: **#ESC-2026-DL-9842** (सक्रिय)\n• विशेष भूमि अधिग्रहण अधिकारी (SLAO): **श्री राजेश वर्मा, IAS** (उत्तरी दिल्ली कलक्ट्रेट)\n• नोडल हेल्पलाइन डेस्क: **सुश्री प्रिया शर्मा (वरिष्ठ सहायता अधिकारी)**\n\nआप अभी नीचे दिए गए बटनों द्वारा लाइव सहायता अधिकारी से जुड़ सकते हैं या सीधे 1800 टोल-फ्री नंबर पर कॉल कर सकते हैं।`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'ESCALATION',
          dataHighlights: [
            { label: 'एस्केलेशन टोकन', value: '#ESC-2026-DL-9842', badge: 'उच्च प्राथमिकता' },
            { label: 'धारा 80 विलंब ब्याज', value: '9% से 15% वार्षिक', badge: 'वैधानिक अधिकार' },
            { label: 'टोल-फ्री हेल्पलाइन', value: '1800-180-BHUMI' }
          ],
          actions: [
            { label: 'Connect to Live Support Officer', labelHi: 'लाइव सहायता अधिकारी से बात करें', actionType: 'MODAL', target: 'OPEN_LIVE_SUPPORT_MODAL' },
            { label: 'Call Citizen Toll-Free (1800-180-24864)', labelHi: 'टोल-फ्री हेल्पलाइन (1800-180-24864)', actionType: 'MODAL', target: 'CALL_HELPLINE' },
            { label: 'File Priority SLAO Grievance', labelHi: 'SLAO को प्राथमिकता शिकायत भेजें', actionType: 'MODAL', target: 'OPEN_GRIEVANCE_MODAL' }
          ]
        };
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `🚨 **HIGH PRIORITY CITIZEN ESCALATION & LIVE CARE PROTOCOL** 🚨\n\nHello **${parcel.ownerName}**, we understand your compensation has experienced an unacceptable multi-month delay. Your case has been immediately flagged and escalated to the **National Landowner Grievance Cell & Live Customer Care Desk**.\n\n⚖️ **Statutory Protection under Section 80 of RFCTLARR Act 2013:**\n• **Mandatory Statutory Interest:** If compensation is not paid within the mandated timeline upon taking possession, the acquiring authority is statutorily liable to pay interest **@ 9% per annum** for the first year, and **@ 15% per annum** for subsequent delayed months until full realization.\n• **Priority Escalation Token:** **#ESC-2026-DL-9842** (Direct SLAO North Delhi Docket)\n• **Competent Authority:** **Shri Rajesh Verma, IAS** (Special Land Acquisition Officer)\n• **Assigned Live Desk Lead:** **Officer Priya Sharma** (Citizen Assistance Cell)\n\nPlease click below to immediately connect with a **Live Support Specialist** or dial our toll-free direct line.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'ESCALATION',
        dataHighlights: [
          { label: 'Escalation Token', value: '#ESC-2026-DL-9842', badge: 'High Priority' },
          { label: 'Sec 80 Delay Interest', value: '9% - 15% p.a.', badge: 'Statutory Right' },
          { label: 'Toll-Free Helpline', value: '1800-180-BHUMI' }
        ],
        actions: [
          { label: 'Connect to Live Support Officer', labelHi: 'लाइव सहायता अधिकारी से बात करें', actionType: 'MODAL', target: 'OPEN_LIVE_SUPPORT_MODAL' },
          { label: 'Call Citizen Toll-Free (1800-180-24864)', labelHi: 'टोल-फ्री हेल्पलाइन (1800-180-24864)', actionType: 'MODAL', target: 'CALL_HELPLINE' },
          { label: 'File Priority SLAO Grievance', labelHi: 'SLAO को प्राथमिकता शिकायत भेजें', actionType: 'MODAL', target: 'OPEN_GRIEVANCE_MODAL' }
        ]
      };
    }

    // =========================================================================
    // 5. COMPENSATION NOT PROCESSED YET (Question 5)
    // =========================================================================
    if (
      (q.includes('not processed') || q.includes('not been processed') || q.includes('has not processed') || q.includes('process nahi hua') || q.includes('not received') || q.includes('pending') || q.includes('प्रक्रियाधीन नहीं') || q.includes('संसाधित नहीं हुआ') || q.includes('मुआवजा नहीं मिला')) &&
      (q.includes('compensation') || q.includes('land') || q.includes('muavza') || q.includes('मुआवजा') || q.includes('पैसा') || q.includes('help') || q.includes('मदद'))
    ) {
      if (isHindi) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: `नमस्ते **श्री ${parcel.ownerName} जी**, आपके खसरा नंबर **${parcel.khasraNumber}** (ग्राम: ${parcel.village}) के मुआवजे की स्थिति का पूर्ण निदान (Status Diagnosis):\n\n• **स्वीकृत अवार्ड राशि:** **₹${(parcel.totalCompensation).toLocaleString('en-IN')}** (मूल भूमि मूल्य ₹${(parcel.marketValueTotal).toLocaleString('en-IN')} + 100% वैधानिक सोलेशियम ₹${(parcel.solatiumAmount).toLocaleString('en-IN')} + संपत्ति ₹${(parcel.additionalAssetValue).toLocaleString('en-IN')})\n• **सत्यापन स्थिति:** विशेष भूमि अधिग्रहण अधिकारी (SLAO) द्वारा **धारा 23 अवार्ड पूर्ण रूप से स्वीकृत** हो चुका है।\n• **वर्तमान चरण:** भुगतान वाउचर PFMS (सार्वजनिक वित्तीय प्रबंधन प्रणाली) के डिजिटल सिग्नेचर टोकन बैच में है, जो सीधे आपके **SBI बैंक खाते (${comp.bankAccountMasked})** में अंतरित किया जाएगा।\n\n**आपके लिए त्वरित कदम:**\n1. सुनिश्चित करें कि आपका बैंक खाता आधार से लिंक (NPCI e-KYC) है।\n2. यदि आपको 3-5 कार्य दिवसों में बैंक SMS प्राप्त न हो, तो नीचे दिए गए बटन से लेजर जांचें या सीधे SLAO को इंक्वायरी भेजें।`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'COMPENSATION',
          dataHighlights: [
            { label: 'स्वीकृत अवार्ड', value: `₹${(parcel.totalCompensation).toLocaleString('en-IN')}`, badge: 'SLAO स्वीकृत' },
            { label: 'वर्तमान चरण', value: 'PFMS DBT अंतरण कतार में', badge: 'SBI ****4821' },
            { label: 'अपेक्षित समय', value: '3-5 कार्य दिवस' }
          ],
          actions: [
            { label: 'Check Payment Ledger', labelHi: 'भुगतान लेजर देखें', actionType: 'NAVIGATE', target: '/landowner/payments' },
            { label: 'Verify Bank & IFSC Details', labelHi: 'बैंक विवरण सत्यापित करें', actionType: 'NAVIGATE', target: '/landowner/documents' },
            { label: 'Contact SLAO Nodal Desk', labelHi: 'SLAO नोडल डेस्क से संपर्क करें', actionType: 'MODAL', target: 'OPEN_GRIEVANCE_MODAL' }
          ]
        };
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `Hello **${parcel.ownerName}**, here is the exact diagnostic audit for your compensation on **Parcel ${parcel.id}** (Khasra No. **${parcel.khasraNumber}**, Village ${parcel.village}):\n\n• **Total Statutory Award:** **₹${(parcel.totalCompensation).toLocaleString('en-IN')}** (Base Value ₹${(parcel.marketValueTotal).toLocaleString('en-IN')} + 100% Solatium ₹${(parcel.solatiumAmount).toLocaleString('en-IN')} + Assets ₹${(parcel.additionalAssetValue).toLocaleString('en-IN')})\n• **Approval Status:** Formally sanctioned under **Section 23 Award** by SLAO North Delhi.\n• **Current Stage:** The payment file is in the automated **PFMS (Public Financial Management System)** disbursement queue for direct electronic credit to your **State Bank of India A/C ending ****4821** (IFSC: SBIN0001234).\n\n**Actionable Checklist:**\n1. Ensure your bank account has active NPCI Aadhaar seeding.\n2. Normal PFMS batch settlement takes **3–5 business days**.\n3. If already delayed past expectations, you can escalate immediately or view the detailed ledger below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'COMPENSATION',
        dataHighlights: [
          { label: 'Approved Compensation', value: `₹${(parcel.totalCompensation).toLocaleString('en-IN')}`, badge: 'Section 23 Sanctioned' },
          { label: 'Disbursement Route', value: 'Direct Benefit Transfer (PFMS)', badge: 'SBI ****4821' },
          { label: 'Disbursement ETA', value: '3-5 Working Days' }
        ],
        actions: [
          { label: 'Check Payment Ledger', labelHi: 'भुगतान लेजर देखें', actionType: 'NAVIGATE', target: '/landowner/payments' },
          { label: 'Verify Bank & IFSC Details', labelHi: 'बैंक विवरण सत्यापित करें', actionType: 'NAVIGATE', target: '/landowner/documents' },
          { label: 'Contact SLAO Nodal Desk', labelHi: 'SLAO नोडल डेस्क से संपर्क करें', actionType: 'MODAL', target: 'OPEN_GRIEVANCE_MODAL' }
        ]
      };
    }

    // =========================================================================
    // 1. WHAT IS BHOOMISETU? (Question 1)
    // =========================================================================
    if (
      q.includes('what is bhoomisetu') ||
      q.includes('what is bhoomi setu') ||
      q.includes('bhoomisetu kya hai') ||
      q.includes('bhoomi setu kya hai') ||
      q.includes('भूमिसेतु क्या है') ||
      q.includes('about bhoomisetu') ||
      q.includes('about bhoomi setu') ||
      q.includes('overview of bhoomisetu') ||
      q.includes('tell me about bhoomisetu') ||
      q.includes('what does bhoomisetu do')
    ) {
      if (isHindi) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: `🏛️ **भूमिसेतु (BhoomiSetu) क्या है?**\n\n**भूमिसेतु** भारत सरकार के **RFCTLARR अधिनियम, 2013** (उचित प्रतिकर और पारदर्शिता का अधिकार) के तहत विकसित एक एकीकृत, पारदर्शी राष्ट्रीय भूमि अधिग्रहण, मूल्यांकन एवं DBT प्रबंधन डिजिटल प्लेटफॉर्म है।\n\n**भूमिसेतु के मुख्य स्तंभ:**\n1. **नागरिक एवं किसान सशक्तिकरण:** किसानों को 100% सोलेशियम, सर्कल रेट और बैंक खाते में सीधे DBT भुगतान की पारदर्शी जानकारी प्रदान करता है।\n2. **GIS सैटेलाइट कैडस्ट्रल मैपिंग:** जमीन के खसरा नंबरों और सीमांकन का सैटेलाइट व ड्रोन सर्वे द्वारा डिजिटल सत्यापन, जिससे सीमाओं पर कोई विवाद न रहे।\n3. **AI दस्तावेज बुद्धिमत्ता:** 7/12 जमाबंदी, खतौनी व राजस्व रिकॉर्ड का स्वतः OCR सत्यापन।\n4. **मध्यस्थों की समाप्ति:** ट्रेजरी (PFMS) से सीधे किसान के आधार-लिंक्ड बैंक खाते में 100% सुरक्षित भुगतान।`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'PLATFORM',
          dataHighlights: [
            { label: 'कानूनी आधार', value: 'RFCTLARR Act 2013', badge: 'भारत सरकार' },
            { label: 'सोलेशियम गारंटी', value: '100% अतिरिक्त वैधानिक मुआवजा' },
            { label: 'भुगतान प्रणाली', value: 'PFMS Direct Benefit Transfer' }
          ],
          actions: [
            { label: 'Why is BhoomiSetu Important?', labelHi: 'भूमिसेतु क्यों महत्वपूर्ण है?', actionType: 'QUERY', target: 'Why is bhoomiSetu important?' },
            { label: 'Why is BhoomiSetu Safe?', labelHi: 'भूमिसेतु क्यों सुरक्षित है?', actionType: 'QUERY', target: 'Why is bhoomisetu safe?' },
            { label: 'How to Navigate BhoomiSetu', labelHi: 'भूमिसेतु को कैसे नेविगेट करें?', actionType: 'QUERY', target: 'How to navigate bhoomisetu?' }
          ]
        };
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `🏛️ **What is BhoomiSetu (भूमिसेतु)?**\n\n**BhoomiSetu** is India's next-generation, unified digital governance platform for Land Acquisition, GIS Cadastral Demarcation, and Direct Benefit Transfer (DBT) management, engineered in strict compliance with the **RFCTLARR Act, 2013** (Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act).\n\n**Core Pillars of BhoomiSetu:**\n1. **Citizen & Landowner Empowerment:** Provides farmers and property owners with instant, 100% transparent visibility into land valuation, statutory 100% solatium, and direct bank payouts.\n2. **GIS Cadastral Layering:** Integrates high-precision satellite & drone demarcation directly with revenue survey boundaries to eliminate boundary disputes.\n3. **AI Document Intelligence:** Automates extraction and verification of 7/12 Jamabandi, Khatauni RoRs, and Aadhaar e-KYC.\n4. **Zero-Intermediary DBT:** Disburses statutory compensation straight from the National Treasury (PFMS) into the landowner's verified bank account without middlemen.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'PLATFORM',
        dataHighlights: [
          { label: 'Statutory Act', value: 'RFCTLARR Act 2013', badge: 'Govt of India' },
          { label: 'Solatium Guarantee', value: '100% Statutory Solatium (Sec 30(1))' },
          { label: 'Disbursement', value: 'Direct PFMS Treasury Transfer' }
        ],
        actions: [
          { label: 'Why is BhoomiSetu Important?', labelHi: 'भूमिसेतु क्यों महत्वपूर्ण है?', actionType: 'QUERY', target: 'Why is bhoomiSetu important?' },
          { label: 'Why is BhoomiSetu Safe?', labelHi: 'भूमिसेतु क्यों सुरक्षित है?', actionType: 'QUERY', target: 'Why is bhoomisetu safe?' },
          { label: 'How to Navigate BhoomiSetu', labelHi: 'भूमिसेतु को कैसे नेविगेट करें?', actionType: 'QUERY', target: 'How to navigate bhoomisetu?' }
        ]
      };
    }

    // =========================================================================
    // 2. WHY IS BHOOMISETU IMPORTANT? (Question 2)
    // =========================================================================
    if (
      q.includes('why is bhoomisetu important') ||
      q.includes('why is bhoomi setu important') ||
      q.includes('importance of bhoomisetu') ||
      q.includes('bhoomisetu kyu zaroori hai') ||
      q.includes('भूमिसेतु क्यों महत्वपूर्ण है') ||
      q.includes('why use bhoomisetu') ||
      q.includes('benefits of bhoomisetu') ||
      q.includes('why is it important')
    ) {
      if (isHindi) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: `🌟 **भूमिसेतु क्यों महत्वपूर्ण है? (Why is BhoomiSetu Important?)**\n\nपारंपरिक भूमि अधिग्रहण में दशकों तक चलने वाले विलंब, बिचौलियों के भ्रष्टाचार और कागजी अस्पष्टता की समस्या रहती थी। भूमिसेतु निम्नलिखित कारणों से अत्यंत महत्वपूर्ण व क्रांतिकारी है:\n\n1. **भ्रष्टाचार व बिचौलियों का अंत:** मुआवजा राशि सीधे PFMS के माध्यम से किसान के बैंक खाते में जमा होती है, जिससे किसी तीसरे पक्ष की गुंजाइश नहीं रहती।\n2. **100% सोलेशियम की कानूनी गारंटी:** RFCTLARR अधिनियम की धारा 30(1) के तहत मूल भूमि मूल्य के बराबर 100% अतिरिक्त वैधानिक सोलेशियम सुनिश्चित किया जाता है।\n3. **समयबद्ध वैधानिक प्रक्रिया:** धारा 3A, 3D अधिसूचना और धारा 23 अवार्ड के प्रत्येक चरण की रियल-टाइम SLA ट्रैकिंग होती है।\n4. **विवाद-मुक्त सीमांकन:** GIS सैटेलाइट कोऑर्डिनेट्स से जमीन के रकबे का सटीक सत्यापन होता है, जिससे सीमा विवाद समाप्त होते हैं।\n5. **त्वरित शिकायत निवारण:** धारा 15(1) के तहत SLAO को सीधे आपत्ति दर्ज कराने और 7-15 दिनों में समाधान की सुविधा।`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'PLATFORM',
          dataHighlights: [
            { label: 'पारदर्शिता', value: '100% डिजिटल व सीधा DBT', badge: 'शून्य बिचौलिया' },
            { label: 'कर छूट', value: 'धारा 96 के तहत 0% TDS', badge: 'कृषि भूमि' },
            { label: 'निस्तारण समय', value: '7 से 15 कार्य दिवस' }
          ],
          actions: [
            { label: 'What is BhoomiSetu?', labelHi: 'भूमिसेतु क्या है?', actionType: 'QUERY', target: 'What is BhoomiSetu?' },
            { label: 'Why is BhoomiSetu Safe?', labelHi: 'भूमिसेतु क्यों सुरक्षित है?', actionType: 'QUERY', target: 'Why is bhoomisetu safe?' },
            { label: 'View My Compensation Award', labelHi: 'मेरा मुआवजा देखें', actionType: 'NAVIGATE', target: '/landowner/payments' }
          ]
        };
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `🌟 **Why is BhoomiSetu Important?**\n\nHistorically, public land acquisition in India was hindered by multi-year procedural bottlenecks, revenue record tampering, and opaque physical compensation files. BhoomiSetu transforms this paradigm:\n\n1. **Zero Middlemen & Full Transparency:** Direct electronic disbursements eliminate commissions, leakages, and touts by wiring compensation directly through the Public Financial Management System (PFMS).\n2. **Mandatory 100% Solatium Guarantee:** Enforces Section 30(1) of RFCTLARR Act 2013, doubling the base market valuation automatically with statutory 100% solatium.\n3. **Automated Statutory Timelines:** Tracks every regulatory milestone (Section 3A notification, Section 3D declaration, Section 23 award) with automated bottleneck alerts.\n4. **Dispute-Free GIS Demarcation:** Satellite-ground synced cadastral overlays guarantee accurate land extent without overlapping claims.\n5. **Empowered Citizen Redressal:** Built-in Section 15(1) statutory objection filing and expedited grievance handling directly with District Collectors.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'PLATFORM',
        dataHighlights: [
          { label: 'Transparency', value: 'Direct PFMS Bank Transfer', badge: 'Zero Middlemen' },
          { label: 'Tax Protection', value: 'Section 96: 0% TDS Deduction', badge: 'Agricultural Land' },
          { label: 'SLA Redressal', value: '7 - 15 Working Days' }
        ],
        actions: [
          { label: 'What is BhoomiSetu?', labelHi: 'भूमिसेतु क्या है?', actionType: 'QUERY', target: 'What is BhoomiSetu?' },
          { label: 'Why is BhoomiSetu Safe?', labelHi: 'भूमिसेतु क्यों सुरक्षित है?', actionType: 'QUERY', target: 'Why is bhoomisetu safe?' },
          { label: 'View My Compensation Award', labelHi: 'मेरा मुआवजा देखें', actionType: 'NAVIGATE', target: '/landowner/payments' }
        ]
      };
    }

    // =========================================================================
    // 3. WHY IS BHOOMISETU SAFE? (Question 3)
    // =========================================================================
    if (
      q.includes('why is bhoomisetu safe') ||
      q.includes('why is bhoomi setu safe') ||
      q.includes('is bhoomisetu safe') ||
      q.includes('how safe is bhoomisetu') ||
      q.includes('security') ||
      q.includes('surakshit') ||
      q.includes('सुरक्षित') ||
      q.includes('safety') ||
      q.includes('safe')
    ) {
      if (isHindi) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: `🛡️ **भूमिसेतु क्यों सुरक्षित है? (Why is BhoomiSetu Safe?)**\n\nभूमिसेतु को भारत सरकार के कड़े साइबर सुरक्षा व डिजिटल गवर्नेंस मानकों पर तैयार किया गया है:\n\n1. **आधार e-KYC व डिजिलॉकर प्रमाणीकरण:** केवल सत्यापित भूस्वामी ही अपने भूखंड और मुआवजे तक पहुंच सकते हैं।\n2. **सीधा ट्रेजरी बैंक अंतरण (PFMS DBT):** राशि किसी निजी खाते या मध्यस्थ एजेंसी में नहीं जाती, बल्कि सीधे राष्ट्रीय कोष से आपके बैंक खाते (SBI ****4821) में ट्रांसफर होती है।\n3. **अपरिवर्तनीय ऑडिट ट्रेल (Immutable Logs):** भूमि सीमांकन, सर्कल रेट और अनुमोदन के प्रत्येक चरण का डिजिटल टाइमस्टैम्प सुरक्षित रहता है, जिससे कोई अनधिकृत बदलाव संभव नहीं है।\n4. **RFCTLARR 2013 वैधानिक सुरक्षा:** धारा 80 के तहत भुगतान में देरी होने पर 9% से 15% वार्षिक ब्याज पाने का कानूनी अधिकार।\n5. **डेटा एन्क्रिप्शन:** सभी व्यक्तिगत दस्तावेज 256-बिट बैंक-ग्रेड एन्क्रिप्शन से सुरक्षित हैं।`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'SAFETY',
          dataHighlights: [
            { label: 'प्रमाणीकरण', value: 'Aadhaar e-KYC & DigiLocker', badge: 'सत्यापित' },
            { label: 'डेटा सुरक्षा', value: '256-Bit Bank-Grade Encryption' },
            { label: 'ऑडिट सुरक्षा', value: 'Cryptographic Immutable Trail' }
          ],
          actions: [
            { label: 'Check My Bank & e-KYC Status', labelHi: 'बैंक व e-KYC स्थिति देखें', actionType: 'NAVIGATE', target: '/landowner/documents' },
            { label: 'Open Document Vault', labelHi: 'दस्तावेज वॉल्ट खोलें', actionType: 'NAVIGATE', target: '/landowner/documents' },
            { label: 'How to Navigate BhoomiSetu', labelHi: 'भूमिसेतु कैसे नेविगेट करें?', actionType: 'QUERY', target: 'How to navigate bhoomisetu?' }
          ]
        };
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `🛡️ **Why is BhoomiSetu Safe?**\n\nBhoomiSetu is built on sovereign-grade enterprise security and statutory compliance standards:\n\n1. **Aadhaar e-KYC & DigiLocker Verification:** Direct biometric and OTP-backed authentication ensures only genuine landowners can view and manage compensation claims.\n2. **PFMS Direct Treasury Transfer:** Funds move directly from the Government of India Consolidated Fund/PFMS into your authenticated bank account (SBI ****4821)—no escrow hold-ups or third-party handling.\n3. **Cryptographic Audit Trails:** Every parcel demarcation, circle rate calculation, and SLAO approval is immutably timestamped and digitally signed.\n4. **Statutory RFCTLARR Legal Protection:** Full compliance with Section 30(1) (100% Solatium), Section 96 (Tax Exemption), and Section 80 (9%–15% statutory penal interest on delay).\n5. **Bank-Grade Data Encryption:** End-to-end 256-bit encryption safeguards your land title deeds, passbooks, and personal records.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'SAFETY',
        dataHighlights: [
          { label: 'Identity Protocol', value: 'Aadhaar e-KYC & DigiLocker', badge: 'Govt Certified' },
          { label: 'Data Security', value: '256-Bit Bank-Grade Encryption' },
          { label: 'Audit Security', value: 'Cryptographic Immutable Trail' }
        ],
        actions: [
          { label: 'Check My Bank & e-KYC Status', labelHi: 'बैंक व e-KYC स्थिति देखें', actionType: 'NAVIGATE', target: '/landowner/documents' },
          { label: 'Open Document Vault', labelHi: 'दस्तावेज वॉल्ट खोलें', actionType: 'NAVIGATE', target: '/landowner/documents' },
          { label: 'How to Navigate BhoomiSetu', labelHi: 'भूमिसेतु कैसे नेविगेट करें?', actionType: 'QUERY', target: 'How to navigate bhoomisetu?' }
        ]
      };
    }

    // =========================================================================
    // 4. HOW TO NAVIGATE BHOOMISETU? (Question 4)
    // =========================================================================
    if (
      q.includes('how to navigate') ||
      q.includes('navigate bhoomisetu') ||
      q.includes('how to use bhoomisetu') ||
      q.includes('how to use') ||
      q.includes('kaise chalaye') ||
      q.includes('kaise use kare') ||
      q.includes('कैसे उपयोग करें') ||
      q.includes('नेविगेट कैसे करें') ||
      q.includes('guide') ||
      q.includes('walkthrough')
    ) {
      if (isHindi) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: `🧭 **भूमिसेतु को कैसे नेविगेट करें? (Step-by-Step Navigation Guide)**\n\nभूमिसेतु पोर्टल को सरल एवं सहज बनाया गया है। आप मुख्य रूप से इन 5 अनुभागों का उपयोग कर सकते हैं:\n\n1. 📊 **डैशबोर्ड (Dashboard):** आपके भूखंड (खसरा 45/12/1), रकबा (2.40 एकड़), स्वीकृत ₹88.90 लाख मुआवजे और परियोजना की समग्र स्थिति।\n2. 💰 **मुआवजा लेजर (Payment Status):** मूल भूमि मूल्य, 100% सोलेशियम, पेड़/नलकूप मूल्यांकन और PFMS DBT बैंक ट्रांसफर की लाइव ट्रैकिंग।\n3. 📁 **दस्तावेज वॉल्ट (Documents):** सत्यापित 7/12 जमाबंदी, e-KYC स्थिति, बैंक पासबुक और सह-खातेदार शपथ पत्र अपलोड करने की सुविधा।\n4. 🤖 **भूमिमित्र AI सहायक (BhoomiMitra AI):** 24x7 हिंदी व अंग्रेजी में बोलकर या लिखकर किसी भी सवाल का तुरंत जवाब पाएं।\n5. ⚖️ **शिकायत व आपत्ति (Grievance Redressal):** धारा 15(1) के तहत SLAO को आपत्ति दर्ज करें या देरी होने पर लाइव कस्टमर केयर से संपर्क करें।`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'NAVIGATION',
          dataHighlights: [
            { label: 'डैशबोर्ड', value: 'भूखंड व मुआवजा सारांश', badge: 'Khasra 45/12' },
            { label: 'मुआवजा लेजर', value: '₹88.90 Lakh PFMS DBT' },
            { label: 'सहायता', value: 'भूमिमित्र AI 24x7 Assistant' }
          ],
          actions: [
            { label: 'Go to My Dashboard', labelHi: 'डैशबोर्ड पर जाएं', actionType: 'NAVIGATE', target: '/landowner/dashboard' },
            { label: 'Open Compensation Ledger', labelHi: 'मुआवजा लेजर खोलें', actionType: 'NAVIGATE', target: '/landowner/payments' },
            { label: 'Open Document Vault', labelHi: 'दस्तावेज वॉल्ट खोलें', actionType: 'NAVIGATE', target: '/landowner/documents' }
          ]
        };
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `🧭 **How to Navigate BhoomiSetu (Platform Walkthrough)**\n\nBhoomiSetu is organized into intuitive, single-window citizen sections:\n\n1. 📊 **Landowner Dashboard (/landowner/dashboard):** View your complete landholding dossier, Khasra **45/12/1**, 2.40 Acres area, and total approved **₹88.90 Lakh** statutory award.\n2. 💰 **Compensation & Payment Ledger (/landowner/payments):** Inspect the exact breakdown of base circle rate, 100% solatium, asset valuation, and live PFMS bank transfer stages.\n3. 📁 **Digital Document Vault (/landowner/documents):** View verified 7/12 Jamabandi RoRs, check Aadhaar e-KYC status, and upload bank passbooks or co-sharer affidavits.\n4. 🤖 **BhoomiMitra AI Assistant (/landowner/assistant):** 24x7 voice & text interactive guidance in English and Hindi for statutory inquiries.\n5. ⚖️ **Grievance Redressal & Live Support:** File Section 15(1) objections or escalate delayed compensation directly to the Special Land Acquisition Officer (SLAO).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'NAVIGATION',
        dataHighlights: [
          { label: 'Dashboard', value: 'Active Landholding Dossier', badge: 'Khasra 45/12' },
          { label: 'Compensation', value: '₹88.90 Lakh Detailed Breakdown' },
          { label: 'Assistance', value: 'BhoomiMitra AI 24x7' }
        ],
        actions: [
          { label: 'Go to My Dashboard', labelHi: 'डैशबोर्ड पर जाएं', actionType: 'NAVIGATE', target: '/landowner/dashboard' },
          { label: 'Open Compensation Ledger', labelHi: 'मुआवजा लेजर खोलें', actionType: 'NAVIGATE', target: '/landowner/payments' },
          { label: 'Open Document Vault', labelHi: 'दस्तावेज वॉल्ट खोलें', actionType: 'NAVIGATE', target: '/landowner/documents' }
        ]
      };
    }

    // =========================================================================
    // EXISTING DOMAIN FALLBACKS (Compensation, DBT, Parcel, Docs, Grievance, Welcome)
    // =========================================================================

    // 7. COMPENSATION & CALCULATION QUERY
    if (
      q.includes('compensation') || 
      q.includes('calculate') || 
      q.includes('money') || 
      q.includes('solatium') || 
      q.includes('circle rate') || 
      q.includes('amount') || 
      q.includes('kitna') || 
      q.includes('muavza') || 
      q.includes('मुआवजा') || 
      q.includes('राशि') || 
      q.includes('पैसा')
    ) {
      if (isHindi) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: `नमस्ते **श्री ${parcel.ownerName} जी**,\n\nRFCTLARR अधिनियम 2013 के तहत आपके खसरा नंबर **${parcel.khasraNumber}** (ग्राम: ${parcel.village}) का कुल वैधानिक मुआवजा **₹${(parcel.totalCompensation).toLocaleString('en-IN')}** निर्धारित किया गया है।\n\n**मुआवजे का पूर्ण विवरण:**\n• **मूल भूमि मूल्य (${parcel.areaAcres} एकड़ @ ₹${(parcel.circleRatePerAcre).toLocaleString('en-IN')}/एकड़):** ₹${(parcel.marketValueTotal).toLocaleString('en-IN')}\n• **100% वैधानिक सोलेशियम (धारा 30(1)):** +₹${(parcel.solatiumAmount).toLocaleString('en-IN')}\n• **पेड़/नलकूप/संपत्ति का मूल्यांकन:** +₹${(parcel.additionalAssetValue).toLocaleString('en-IN')}\n• **कुल देय राशि:** **₹${(parcel.totalCompensation).toLocaleString('en-IN')}** (अट्ठासी लाख नब्बे हजार रुपये)\n\n*नोट: धारा 96 के तहत कृषि भूमि के इस मुआवजे पर कोई आयकर (TDS) नहीं काटा जाता है।*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'COMPENSATION',
          dataHighlights: [
            { label: 'कुल मुआवजा', value: `₹${(parcel.totalCompensation).toLocaleString('en-IN')}`, badge: '100% सोलेशियम' },
            { label: 'मूल भूमि मूल्य', value: `₹${(parcel.marketValueTotal).toLocaleString('en-IN')}` },
            { label: 'बैंक खाता', value: `${comp.bankName} (****4821)` }
          ],
          actions: [
            { label: 'View Compensation Ledger', labelHi: 'मुआवजा लेजर देखें', actionType: 'NAVIGATE', target: '/landowner/payments' },
            { label: 'Download Award Letter', labelHi: 'अवार्ड पत्र डाउनलोड करें', actionType: 'MODAL', target: 'DOWNLOAD_AWARD' }
          ]
        };
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `Hello **${parcel.ownerName}**,\n\nUnder Section 26 to 30 of the RFCTLARR Act 2013, the total approved compensation entitlement for your parcel **${parcel.id}** (Khasra No: **${parcel.khasraNumber}**, Village: ${parcel.village}) is **₹${(parcel.totalCompensation).toLocaleString('en-IN')}**.\n\n**Statutory Breakdown:**\n• **Base Land Value (${parcel.areaAcres} Acres @ ₹${(parcel.circleRatePerAcre).toLocaleString('en-IN')}/Acre):** ₹${(parcel.marketValueTotal).toLocaleString('en-IN')}\n• **100% Mandatory Solatium (Sec 30(1)):** +₹${(parcel.solatiumAmount).toLocaleString('en-IN')}\n• **Structures, Trees & Asset Value:** +₹${(parcel.additionalAssetValue).toLocaleString('en-IN')}\n• **Net Entitlement:** **₹${(parcel.totalCompensation).toLocaleString('en-IN')}** (Eighty-Eight Lakh Ninety Thousand Only)\n\n*Tax Exemption Note: Under Section 96 of RFCTLARR Act, no income tax or TDS is deductible from this agricultural land acquisition compensation.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'COMPENSATION',
        dataHighlights: [
          { label: 'Total Entitlement', value: `₹${(parcel.totalCompensation).toLocaleString('en-IN')}`, badge: '100% Solatium Guaranteed' },
          { label: 'Base Land Value', value: `₹${(parcel.marketValueTotal).toLocaleString('en-IN')}` },
          { label: 'Linked Bank Account', value: `${comp.bankName} (****4821)` }
        ],
        actions: [
          { label: 'View Compensation Ledger', labelHi: 'मुआवजा लेजर देखें', actionType: 'NAVIGATE', target: '/landowner/payments' },
          { label: 'Download Award Letter', labelHi: 'अवार्ड पत्र डाउनलोड करें', actionType: 'MODAL', target: 'DOWNLOAD_AWARD' }
        ]
      };
    }

    // 8. PAYMENT / DBT / BANK TRANSFER QUERY
    if (
      q.includes('dbt') || 
      q.includes('payment') || 
      q.includes('bank') || 
      q.includes('transfer') || 
      q.includes('disburs') || 
      q.includes('pfms') || 
      q.includes('account') || 
      q.includes('khata') || 
      q.includes('भुगतान') || 
      q.includes('खाता') || 
      q.includes('कब आएगा') || 
      q.includes('बैंक')
    ) {
      if (isHindi) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: `आपके बैंक खाते में DBT भुगतान की वर्तमान स्थिति:\n\n• **बैंक विवरण:** ${comp.bankName}, खाता: **${comp.bankAccountMasked}** (IFSC: ${comp.ifscCode})\n• **अवार्ड सूचना क्रमांक:** ${comp.awardNotificationNo}\n• **वर्तमान चरण:** **विशेष भूमि अधिग्रहण अधिकारी (SLAO) उत्तरी दिल्ली** द्वारा धारा 23 अवार्ड को स्वीकृति दी जा चुकी है। अब PFMS डिजिटल सिग्नेचर टोकन द्वारा राशि सीधे आपके खाते में क्रेडिट करने की प्रक्रिया अंतिम चरण में है।\n• **अपेक्षित समय:** अगले 3 से 5 कार्य दिवसों में राशि DBT द्वारा अंतरित कर दी जाएगी।`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'DBT',
          dataHighlights: [
            { label: 'भुगतान स्थिति', value: 'SLAO स्वीकृति पूर्ण (प्रक्रियाधीन)', badge: 'DBT PFMS' },
            { label: 'बैंक खाता', value: `${comp.bankName} (${comp.bankAccountMasked})` },
            { label: 'राशि', value: `₹${(parcel.totalCompensation).toLocaleString('en-IN')}` }
          ],
          actions: [
            { label: 'Check Payment Status', labelHi: 'भुगतान स्थिति देखें', actionType: 'NAVIGATE', target: '/landowner/payments' },
            { label: 'Update Bank Details', labelHi: 'बैंक विवरण अपडेट करें', actionType: 'NAVIGATE', target: '/landowner/documents' }
          ]
        };
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `Here is the real-time status of your **PFMS Direct Benefit Transfer (DBT)**:\n\n• **Bank Account:** ${comp.bankName}, Account: **${comp.bankAccountMasked}** (IFSC: ${comp.ifscCode})\n• **Award Reference:** ${comp.awardNotificationNo}\n• **Status:** The Section 23 Award has been formally approved by the **Special Land Acquisition Officer (SLAO) North Delhi**. The payment voucher is in the automated PFMS disbursement queue.\n• **Expected Timeline:** Credit is anticipated within **3–5 working days** directly via RTGS/DBT without intermediaries.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'DBT',
        dataHighlights: [
          { label: 'Payment Stage', value: 'SLAO Approved (Queued in PFMS)', badge: 'Direct Benefit Transfer' },
          { label: 'Linked Bank Account', value: `${comp.bankName} (${comp.bankAccountMasked})` },
          { label: 'Disbursement Amount', value: `₹${(parcel.totalCompensation).toLocaleString('en-IN')}` }
        ],
        actions: [
          { label: 'Check Payment Ledger', labelHi: 'भुगतान लेजर देखें', actionType: 'NAVIGATE', target: '/landowner/payments' },
          { label: 'Update Bank / IFSC', labelHi: 'बैंक विवरण अपडेट करें', actionType: 'NAVIGATE', target: '/landowner/documents' }
        ]
      };
    }

    // 9. KHASRA / PARCEL / SURVEY LOOKUP QUERY
    if (
      q.includes('khasra') || 
      q.includes('khatauni') || 
      q.includes('parcel') || 
      q.includes('survey') || 
      q.includes('village') || 
      q.includes('narela') || 
      q.includes('area') || 
      q.includes('land') || 
      q.includes('खसरा') || 
      q.includes('खतौनी') || 
      q.includes('जमीन') || 
      q.includes('रकबा')
    ) {
      if (isHindi) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: `आपकी अधिग्रहित भूमि का विवरण:\n\n• **भूखंड आईडी (Parcel ID):** ${parcel.id}\n• **खसरा नंबर:** **${parcel.khasraNumber}**\n• **खतौनी नंबर:** **${parcel.khatauniNumber}**\n• **ग्राम व जिला:** ${parcel.village}, ${parcel.district}\n• **अधिग्रहित क्षेत्रफल:** **${parcel.areaAcres} एकड़** (${parcel.landType})\n• **परियोजना:** ${parcel.projectName}\n• **वर्तमान स्थिति:** संयुक्त सीमांकन व राजस्व सत्यापन पूर्ण।`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'PARCEL',
          dataHighlights: [
            { label: 'खसरा नंबर', value: parcel.khasraNumber, badge: 'सत्यापित' },
            { label: 'क्षेत्रफल', value: `${parcel.areaAcres} एकड़` },
            { label: 'ग्राम', value: `${parcel.village}, ${parcel.district}` }
          ],
          actions: [
            { label: 'View Land Holding Dossier', labelHi: 'भूमि विवरण देखें', actionType: 'NAVIGATE', target: '/landowner/dashboard' }
          ]
        };
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `Here are the official revenue details for your acquired parcel:\n\n• **Parcel ID:** ${parcel.id}\n• **Khasra Number:** **${parcel.khasraNumber}**\n• **Khatauni Number:** **${parcel.khatauniNumber}**\n• **Location:** Village ${parcel.village}, District ${parcel.district}, Delhi\n• **Acquired Area:** **${parcel.areaAcres} Acres** (${parcel.landType})\n• **Public Project:** ${parcel.projectName}\n• **Survey Verification:** Joint Boundary Survey & GIS Geo-tagging verified by Revenue Inspector.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'PARCEL',
        dataHighlights: [
          { label: 'Khasra Number', value: parcel.khasraNumber, badge: 'Verified RoR' },
          { label: 'Acquired Area', value: `${parcel.areaAcres} Acres` },
          { label: 'Location', value: `${parcel.village}, ${parcel.district}` }
        ],
        actions: [
          { label: 'View Land Holding Dossier', labelHi: 'भूमि विवरण देखें', actionType: 'NAVIGATE', target: '/landowner/dashboard' }
        ]
      };
    }

    // 10. DOCUMENTS & e-KYC QUERY
    if (
      q.includes('document') || 
      q.includes('upload') || 
      q.includes('7/12') || 
      q.includes('jamabandi') || 
      q.includes('aadhaar') || 
      q.includes('kyc') || 
      q.includes('noc') || 
      q.includes('दस्तावेज') || 
      q.includes('कागजात') || 
      q.includes('अपलोड') || 
      q.includes('आधार')
    ) {
      if (isHindi) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: `भूमि अधिग्रहण मुआवजे के लिए आवश्यक एवं सत्यापित दस्तावेज:\n\n1. **7/12 जमाबंदी / खतौनी (RoR):** सत्यापित (Verified) ✅\n2. **आधार e-KYC व पहचान प्रमाण:** डिजिलॉकर सत्यापित ✅\n3. **बैंक पासबुक / कैंसिल्ड चेक:** PFMS पोर्टल पर मान्य ✅\n4. **अनापत्ति प्रमाण पत्र (NOC / Co-sharer declaration):** यदि परिवार में सह-खातेदार हैं तो अतिरिक्त सहमति अपलोड करें।\n\nआप किसी भी समय अपने डिजिटल दस्तावेज वॉल्ट में नए दस्तावेज अपलोड कर सकते हैं।`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'DOCUMENTS',
          actions: [
            { label: 'Upload Documents', labelHi: 'दस्तावेज अपलोड करें', actionType: 'NAVIGATE', target: '/landowner/documents' }
          ]
        };
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `Here is the status of your statutory documents on the portal:\n\n1. **7/12 Jamabandi Record of Rights (RoR):** Verified ✅ (Survey 10293/A)\n2. **Aadhaar e-KYC & ID Proof:** DigiLocker Verified ✅\n3. **Bank Account Mandate:** Verified on PFMS (SBI ****4821) ✅\n4. **No-Objection / Co-sharer Affidavit:** If you have family co-sharers or mutation updates, you can upload supplemental affidavits anytime.\n\nAll documents are securely archived and digitally watermarked.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'DOCUMENTS',
        actions: [
          { label: 'Open Document Vault', labelHi: 'दस्तावेज वॉल्ट खोलें', actionType: 'NAVIGATE', target: '/landowner/documents' }
        ]
      };
    }

    // 11. GRIEVANCE / OBJECTION / SLAO CONTACT QUERY
    if (
      q.includes('grievance') || 
      q.includes('complaint') || 
      q.includes('objection') || 
      q.includes('section 15') || 
      q.includes('dispute') || 
      q.includes('slao') || 
      q.includes('officer') || 
      q.includes('शिकायत') || 
      q.includes('आपत्ति') || 
      q.includes('अधिकारी')
    ) {
      if (isHindi) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: `शिकायत एवं आपत्ति दर्ज करने की प्रक्रिया:\n\n• **धारा 15(1) आपत्ति:** आप भूमि अधिग्रहण अधिसूचना, सर्कल रेट या क्षेत्रफल के विरुद्ध भूमि अधिग्रहण अधिकारी (SLAO) के समक्ष आपत्ति दर्ज करा सकते हैं।\n• **सक्षम प्राधिकारी:** श्री राजेश वर्मा, IAS (विशेष भूमि अधिग्रहण अधिकारी, उत्तरी दिल्ली कलक्ट्रेट)।\n• **पोर्टल सहायता:** आप नीचे दिए गए बटन पर क्लिक करके सीधे ग्रीवेंस दर्ज कर सकते हैं। आपकी शिकायत का 7 कार्य दिवसों में आधिकारिक निस्तारण किया जाता है।`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'GRIEVANCE',
          actions: [
            { label: 'Register Grievance Now', labelHi: 'शिकायत दर्ज करें', actionType: 'MODAL', target: 'OPEN_GRIEVANCE_MODAL' }
          ]
        };
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `Grievance Redressal & Section 15(1) Objections Protocol:\n\n• **Section 15(1) Right to Object:** Any affected landowner may submit objections regarding area demarcation, circle rates, or public purpose directly to the SLAO within the statutory timeline.\n• **Competent Nodal Officer:** Shri Rajesh Verma, IAS (Special Land Acquisition Officer, North Delhi Collectorate).\n• **Direct Redressal:** You can register a formal grievance through this portal. Each query receives a tracking token and is resolved within SLA timelines (max 7-15 days).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'GRIEVANCE',
        actions: [
          { label: 'Register Official Grievance', labelHi: 'आधिकारिक शिकायत दर्ज करें', actionType: 'MODAL', target: 'OPEN_GRIEVANCE_MODAL' }
        ]
      };
    }

    // 12. DEFAULT / GENERAL ASSISTANCE
    if (isHindi) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `नमस्ते **श्री ${parcel.ownerName} जी**! मैं भूमिमित्र AI (BhoomiMitra AI) हूँ — भूमिसेतु पोर्टल पर आपका समर्पित सहायता सहायक।\n\nआप मुझसे निम्नलिखित में से किसी भी विषय पर पूछ सकते हैं:\n\n**प्रस्तुति एवं पोर्टल परिचय:**\n1. भूमिसेतु क्या है? (What is BhoomiSetu?)\n2. भूमिसेतु क्यों महत्वपूर्ण है? (Why is BhoomiSetu important?)\n3. भूमिसेतु क्यों सुरक्षित है? (Why is BhoomiSetu safe?)\n\n**नागरिक सहायता व प्रश्न:**\n4. भूमिसेतु को कैसे नेविगेट करें? (How to navigate BhoomiSetu?)\n5. मेरी भूमि का मुआवजा अभी तक संसाधित नहीं हुआ है (Help compensation not processed)\n6. मुझे पिछले कई महीनों से मुआवजा नहीं मिला है (विलंब एस्केलेशन व लाइव कस्टमर केयर)\n\nकृपया अपना प्रश्न टाइप करें या नीचे दिए गए त्वरित विकल्पों पर क्लिक करें।`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'GENERAL',
        actions: [
          { label: 'What is BhoomiSetu?', labelHi: 'भूमिसेतु क्या है?', actionType: 'QUERY', target: 'What is BhoomiSetu?' },
          { label: 'Why is BhoomiSetu Safe?', labelHi: 'भूमिसेतु क्यों सुरक्षित है?', actionType: 'QUERY', target: 'Why is bhoomisetu safe?' },
          { label: 'How to Navigate Portal', labelHi: 'पोर्टल कैसे नेविगेट करें?', actionType: 'QUERY', target: 'How to navigate bhoomisetu?' }
        ]
      };
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: `Hello **${parcel.ownerName}**! I am **BhoomiMitra AI**, your official statutory assistant on the BhoomiSetu Land Acquisition Platform.\n\nHere are the top inquiries I can assist you with immediately:\n\n**🌟 Presentation & Platform Overview:**\n1. **What is BhoomiSetu?**\n2. **Why is BhoomiSetu important?**\n3. **Why is BhoomiSetu safe?**\n\n**💬 Citizen Inquiries & Escalation:**\n4. **How to navigate BhoomiSetu?**\n5. **Help! My compensation for land has not been processed yet.**\n6. **Help! Not received compensation since last X months (Escalate to Live Support / Customer Care).**\n\nSelect a quick suggestion below or ask any question in English or Hindi!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'GENERAL',
      actions: [
        { label: 'What is BhoomiSetu?', labelHi: 'भूमिसेतु क्या है?', actionType: 'QUERY', target: 'What is BhoomiSetu?' },
        { label: 'Why is BhoomiSetu Safe?', labelHi: 'भूमिसेतु क्यों सुरक्षित है?', actionType: 'QUERY', target: 'Why is bhoomisetu safe?' },
        { label: 'How to Navigate Portal', labelHi: 'पोर्टल कैसे नेविगेट करें?', actionType: 'QUERY', target: 'How to navigate bhoomisetu?' }
      ]
    };
  }
}
