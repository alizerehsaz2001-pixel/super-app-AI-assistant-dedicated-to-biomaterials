import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Loader2, Beaker, RotateCcw, Copy, Check, Sparkles, Database, FlaskConical, ClipboardList, BrainCircuit, BookOpen, Scale, KanbanSquare, Settings, LayoutGrid, ChevronRight, Menu, X, UserPlus, LogIn, Mail, Lock, ShieldCheck, Brain, Download, FileText, Activity, Sun, Moon, BarChart3 } from 'lucide-react';
import { streamChatResponse } from '../services/gemini';
import { Visualization } from './Visualization';
import { DESIGN_SYSTEM_INSTRUCTION, INFORMATICS_SYSTEM_INSTRUCTION, ELN_SYSTEM_INSTRUCTION, ML_SYSTEM_INSTRUCTION, RESEARCH_SYSTEM_INSTRUCTION, REGULATORY_SYSTEM_INSTRUCTION, PROJECT_SYSTEM_INSTRUCTION, INTEGRATION_SYSTEM_INSTRUCTION, META_SYSTEM_INSTRUCTION } from '../constants';

interface Message {
  role: 'user' | 'model';
  text: string;
  thought?: string;
}

type Mode = 'design' | 'informatics' | 'eln' | 'ml' | 'research' | 'regulatory' | 'project' | 'integration' | 'meta';

const INITIAL_MESSAGES: Record<Mode, Message> = {
  design: {
    role: 'model',
    text: "Hello. I am the Biomaterials Design Assistant. Describe your target application (e.g., 'injectable hydrogel for cardiac repair') and I will help you design a formulation."
  },
  informatics: {
    role: 'model',
    text: "Hello. I am the Materials Informatics Specialist. I can help you design databases, extract data from literature, and analyze trends. What would you like to explore?"
  },
  eln: {
    role: 'model',
    text: "Hello. I am your ELN & LIMS Assistant. I can help with protocol design, experiment tracking, and sample management. What experiment are you planning today?"
  },
  ml: {
    role: 'model',
    text: "Hello. I am the Machine Learning Specialist. I can help you analyze experimental data, build predictive models, and suggest new experiments. Please describe your dataset or goal."
  },
  research: {
    role: 'model',
    text: "Hello. I am your Research Assistant. I can help with literature reviews, manuscript writing, and journal selection. What are you working on?"
  },
  regulatory: {
    role: 'model',
    text: "Hello. I am your Regulatory Affairs Specialist. I can help you navigate ISO standards, FDA/EMA pathways, and biocompatibility testing. What is your biomaterial or device?"
  },
  project: {
    role: 'model',
    text: "Hello. I am your Project Management Assistant. I can help you plan timelines, track tasks, and manage resources for your R&D project. What are your project goals?"
  },
  integration: {
    role: 'model',
    text: "Hello. I am your Integration Specialist. I can help you configure your profile, connect to external databases and instruments, and manage plugins. How can I customize the platform for you?"
  },
  meta: {
    role: 'model',
    text: "Hello. I am the Meta-AI Coordinator. I can orchestrate your entire research project across all our specialized assistants. Tell me about your high-level goals or complex challenges."
  }
};

const EXAMPLE_PROMPTS: Record<Mode, string[]> = {
  design: [
    "Injectable hydrogel for cardiac repair",
    "Biodegradable scaffold for bone regeneration",
    "Nanoparticle for targeted cancer drug delivery",
    "Wound healing dressing with antimicrobial properties"
  ],
  informatics: [
    "Design a schema for a hydrogel mechanical property database",
    "Extract data from papers on chitosan wound dressings",
    "Find similar materials to a PEG-DA 10% hydrogel",
    "Analyze trends in hydrogel crosslinking methods"
  ],
  eln: [
    "Protocol for alginate-gelatin hydrogel synthesis",
    "Design a DoE for optimizing nanoparticle size",
    "Create a sample naming convention for my lab",
    "SOP for rheometer calibration"
  ],
  ml: [
    "Analyze correlations in my hydrogel dataset",
    "Build a model to predict drug release profiles",
    "Suggest new formulations using active learning",
    "Explain feature importance for G' prediction"
  ],
  research: [
    "Find recent papers on magnetic hydrogels for cancer",
    "Draft an abstract for my study on silk scaffolds",
    "Suggest Q1 journals for a biomaterials paper",
    "Help me respond to a reviewer comment on statistics"
  ],
  regulatory: [
    "What ISO 10993 tests are needed for a bone implant?",
    "Explain the FDA 510(k) pathway for a wound dressing",
    "Create a risk management matrix for a hydrogel",
    "What are the sterilization requirements for nanoparticles?"
  ],
  project: [
    "Create a Gantt chart for a 2-year Master's project",
    "Design a Kanban board for our lab's synthesis team",
    "Identify risks for a clinical translation project",
    "Draft a budget for a grant application"
  ],
  integration: [
    "Set up my profile for a PhD student in tissue engineering",
    "Connect to PubMed for weekly alerts on hydrogels",
    "How do I integrate data from my Anton Paar rheometer?",
    "Install the Microfluidics Designer plugin"
  ],
  meta: [
    "Plan a full project: injectable hydrogel for liver cancer",
    "I have data but need help with analysis and publication",
    "Guide me from idea to clinical trial for a bone scaffold",
    "Optimize my workflow for a high-throughput screening study"
  ]
};

export default function ChatInterface() {
  const [mode, setMode] = useState<Mode>('design');
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGES.design]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isAllCopied, setIsAllCopied] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mainScrollRef = useRef<HTMLElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Theme management
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Handle scroll visibility for "Scroll to Bottom" button
  useEffect(() => {
    const mainElement = mainScrollRef.current;
    if (!mainElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = mainElement;
      // Show button if we are more than 400px away from the bottom
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 400;
      setShowScrollButton(!isNearBottom);
    };

    mainElement.addEventListener('scroll', handleScroll);
    return () => mainElement.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to reset
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleReset();
      }
      // Cmd/Ctrl + B to toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
      // Cmd/Ctrl + / to focus input
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
      // Cmd/Ctrl + D to toggle thinking
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        setIsThinking(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [mode, messages]); // Dependencies for handleReset

  // Auto-focus input on load and mode change
  useEffect(() => {
    textareaRef.current?.focus();
  }, [mode]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleModeChange = (newMode: Mode) => {
    if (mode === newMode) return;
    if (messages.length > 1 && !window.confirm('Switching modes will clear the current conversation. Continue?')) {
      return;
    }
    setMode(newMode);
    setMessages([INITIAL_MESSAGES[newMode]]);
    if (newMode === 'meta') {
      setIsThinking(true);
    }
  };

  const handleSubmit = async (e?: React.FormEvent, promptText?: string) => {
    e?.preventDefault();
    const textToSend = promptText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let systemInstruction = DESIGN_SYSTEM_INSTRUCTION;
    if (mode === 'informatics') systemInstruction = INFORMATICS_SYSTEM_INSTRUCTION;
    if (mode === 'eln') systemInstruction = ELN_SYSTEM_INSTRUCTION;
    if (mode === 'ml') systemInstruction = ML_SYSTEM_INSTRUCTION;
    if (mode === 'research') systemInstruction = RESEARCH_SYSTEM_INSTRUCTION;
    if (mode === 'regulatory') systemInstruction = REGULATORY_SYSTEM_INSTRUCTION;
    if (mode === 'project') systemInstruction = PROJECT_SYSTEM_INSTRUCTION;
    if (mode === 'integration') systemInstruction = INTEGRATION_SYSTEM_INSTRUCTION;
    if (mode === 'meta') systemInstruction = META_SYSTEM_INSTRUCTION;

    try {
      // Create a placeholder for the model response
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      const stream = streamChatResponse([...messages, userMessage], systemInstruction, isThinking);
      
      let fullResponse = '';
      let fullThought = '';
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        fullThought += chunk.thought;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { 
            role: 'model', 
            text: fullResponse,
            thought: fullThought
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Error: Failed to generate response. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear the conversation?')) {
      setMessages([INITIAL_MESSAGES[mode]]);
    }
  };

  const handleExport = () => {
    const exportContent = messages.map(msg => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      const thought = msg.thought ? `\n> **Reasoning Process:**\n> ${msg.thought.replace(/\n/g, '\n> ')}\n` : '';
      return `### ${role}\n${thought}\n${msg.text}\n`;
    }).join('\n---\n\n');

    const blob = new Blob([exportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biomat-ai-session-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const extractConfidence = (text: string): { score: string | null, cleanText: string } => {
    const match = text.match(/\[\[CONFIDENCE:\s*(High|Medium|Low)\]\]/i);
    if (match) {
      return {
        score: match[1],
        cleanText: text.replace(match[0], '').trim()
      };
    }
    return { score: null, cleanText: text };
  };

  const extractChart = (text: string): { chart: { type: string, title: string, data: any[] } | null, cleanText: string } => {
    const match = text.match(/\[\[CHART:(bar|line|pie|area):([^:]+):([^\]]+)\]\]/i);
    if (match) {
      try {
        const type = match[1];
        const title = match[2];
        const rawData = JSON.parse(match[3]);
        
        // Convert object to array if needed
        const data = Array.isArray(rawData) 
          ? rawData 
          : Object.entries(rawData).map(([name, value]) => ({ name, value }));

        return {
          chart: { type, title, data },
          cleanText: text.replace(match[0], '').trim()
        };
      } catch (e) {
        console.error('Failed to parse chart data:', e);
      }
    }
    return { chart: null, cleanText: text };
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getModeColor = (m: Mode) => {
    switch (m) {
      case 'design': return '#4F46E5'; // indigo
      case 'informatics': return '#10B981'; // emerald
      case 'eln': return '#F43F5E'; // rose
      case 'ml': return '#8B5CF6'; // violet
      case 'research': return '#F59E0B'; // amber
      case 'regulatory': return '#0EA5E9'; // sky
      case 'project': return '#06B6D4'; // cyan
      case 'integration': return '#F97316'; // orange
      case 'meta': return '#D946EF'; // fuchsia
    }
  };

  const getModeTailwindColor = (m: Mode) => {
    switch (m) {
      case 'design': return 'indigo';
      case 'informatics': return 'emerald';
      case 'eln': return 'rose';
      case 'ml': return 'violet';
      case 'research': return 'amber';
      case 'regulatory': return 'sky';
      case 'project': return 'cyan';
      case 'integration': return 'orange';
      case 'meta': return 'fuchsia';
    }
  };

  const getModeIcon = (m: Mode) => {
    switch (m) {
      case 'design': return FlaskConical;
      case 'informatics': return Database;
      case 'eln': return ClipboardList;
      case 'ml': return BrainCircuit;
      case 'research': return BookOpen;
      case 'regulatory': return Scale;
      case 'project': return KanbanSquare;
      case 'integration': return Settings;
      case 'meta': return LayoutGrid;
    }
  };

  const getModeTitle = (m: Mode) => {
    switch (m) {
      case 'design': return 'Biomaterials Design Assistant';
      case 'informatics': return 'Materials Informatics Specialist';
      case 'eln': return 'ELN & LIMS Assistant';
      case 'ml': return 'Machine Learning Specialist';
      case 'research': return 'Research Assistant';
      case 'regulatory': return 'Regulatory Affairs Specialist';
      case 'project': return 'Project Management Assistant';
      case 'integration': return 'Integration Specialist';
      case 'meta': return 'Meta-AI Coordinator';
    }
  };

  const getModeSubtitle = (m: Mode) => {
    switch (m) {
      case 'design': return 'Formulation & Design';
      case 'informatics': return 'Data & Analytics';
      case 'eln': return 'Protocols & Tracking';
      case 'ml': return 'Predictive Modeling & AI';
      case 'research': return 'Literature & Writing';
      case 'regulatory': return 'Compliance & Translation';
      case 'project': return 'Planning & Management';
      case 'integration': return 'Profile & Integrations';
      case 'meta': return 'Orchestration & Strategy';
    }
  };

  return (
    <div className="flex h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans overflow-hidden bg-dot-pattern selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="relative h-full bg-[var(--bg-sidebar)] backdrop-blur-xl border-r border-[var(--border-color)] flex flex-col z-20 overflow-hidden shadow-[4px_0_24px_-12px_rgba(0,0,0,0.3)]"
      >
        <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-sidebar)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
              <Beaker className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-serif font-bold tracking-tight text-xl text-[var(--text-primary)]">BioMat AI</span>
              <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Research OS</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
          <div className="space-y-2">
            <div className="px-2 mb-3 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-[var(--text-muted)]"></div>
              <span className="mono-label">Specialized Assistants</span>
            </div>
            {(['design', 'informatics', 'eln', 'ml', 'research', 'regulatory', 'project', 'integration', 'meta'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                title={getModeTitle(m)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  mode === m 
                    ? `bg-[var(--bg-card-hover)] text-[var(--text-primary)] shadow-md ring-1 ring-[var(--border-color)]` 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'
                }`}
              >
                {mode === m && (
                  <motion.div 
                    layoutId="activeTab"
                    className={`absolute inset-0 bg-gradient-to-r from-${getModeTailwindColor(m)}-500/10 to-transparent opacity-50`} 
                  />
                )}
                <div className={`relative p-2 rounded-lg transition-colors duration-300 ${
                  mode === m 
                    ? `bg-${getModeTailwindColor(m)}-500/20 text-${getModeTailwindColor(m)}-400` 
                    : `bg-[var(--bg-card)] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] group-hover:bg-[var(--bg-card-hover)]`
                }`}>
                  {React.createElement(getModeIcon(m), { className: 'w-4 h-4' })}
                </div>
                <div className="relative flex-1 text-left">
                  <p className={`text-sm font-medium capitalize tracking-tight ${mode === m ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                    {m === 'ml' ? 'ML & AI' : m}
                  </p>
                  {mode === m && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-[10px] text-[var(--text-muted)] font-medium truncate mt-0.5"
                    >
                      {getModeSubtitle(m)}
                    </motion.p>
                  )}
                </div>
                {mode === m && <ChevronRight className="w-4 h-4 text-[var(--text-muted)] relative" />}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-sidebar)]">
          <div className="p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">System Status</p>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-[var(--text-secondary)] tracking-tight">Gemini 3.1 Pro</span>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-[var(--bg-main)]/20 backdrop-blur-[2px]">
        {/* Header */}
        <header className="h-18 flex items-center justify-between px-8 bg-[var(--bg-sidebar)] backdrop-blur-xl border-b border-[var(--border-color)] z-10 sticky top-0 transition-all duration-300">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-[var(--bg-card)] rounded-lg transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              title={isSidebarOpen ? "Close Sidebar (Ctrl+B)" : "Open Sidebar (Ctrl+B)"}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-4">
              <div className={`hidden md:flex p-2 rounded-xl bg-${getModeTailwindColor(mode)}-500/20 shadow-lg shadow-${getModeTailwindColor(mode)}-500/10 ring-1 ring-white/10`}>
                {React.createElement(getModeIcon(mode), { className: `w-4 h-4 text-${getModeTailwindColor(mode)}-400` })}
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight leading-none mb-1.5 text-[var(--text-primary)]">
                  {getModeTitle(mode)}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded-md bg-[var(--bg-card)] text-[10px] text-[var(--text-muted)] font-mono font-medium uppercase tracking-wider border border-[var(--border-color)]">v1.6.0</span>
                  <span className="text-[10px] text-[var(--text-muted)]">•</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-medium tracking-wide">{getModeSubtitle(mode)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] bg-[var(--bg-sidebar)] rounded-xl transition-all border border-[var(--border-color)] shadow-sm hover:shadow-md"
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => {
                const exportContent = messages.map(msg => {
                  const role = msg.role === 'user' ? 'User' : 'Assistant';
                  return `### ${role}\n${msg.text}\n`;
                }).join('\n---\n\n');
                navigator.clipboard.writeText(exportContent);
                setIsAllCopied(true);
                setTimeout(() => setIsAllCopied(false), 2000);
              }}
              className="flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] bg-[var(--bg-sidebar)] rounded-xl transition-all text-xs font-semibold border border-[var(--border-color)] shadow-sm hover:shadow-md"
              title="Copy entire conversation"
            >
              {isAllCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isAllCopied ? 'Copied!' : 'Copy All'}</span>
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] bg-[var(--bg-sidebar)] rounded-xl transition-all text-xs font-semibold border border-[var(--border-color)] shadow-sm hover:shadow-md"
              title="Export conversation"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button 
              onClick={() => setIsRegistrationOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] bg-[var(--bg-sidebar)] rounded-xl transition-all text-xs font-semibold border border-[var(--border-color)] shadow-sm hover:shadow-md"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Register</span>
            </button>
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] bg-[var(--bg-sidebar)] rounded-xl transition-all text-xs font-semibold border border-[var(--border-color)] shadow-sm hover:shadow-md"
              title="Clear conversation (Ctrl+K)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <main 
          ref={mainScrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth relative"
        >
          <div className="max-w-4xl mx-auto space-y-10 pb-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ring-1 ring-white/5 ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white shadow-indigo-500/20' 
                      : `bg-slate-800 text-${getModeTailwindColor(mode)}-400 border border-slate-700`
                  }`}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 max-w-[85%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.role === 'model' && (
                      (() => {
                        const { score, cleanText: textAfterConfidence } = extractConfidence(msg.text);
                        const { chart, cleanText } = extractChart(textAfterConfidence);
                        return (
                          <>
                            {msg.thought && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-4 overflow-hidden"
                              >
                                <details className="group bg-slate-900/50 backdrop-blur-sm border border-fuchsia-900/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                                  <summary className="flex items-center gap-2 px-4 py-2.5 cursor-pointer hover:bg-fuchsia-900/10 transition-colors list-none select-none">
                                    <div className="p-1 rounded bg-fuchsia-900/30 text-fuchsia-400">
                                      <Brain className="w-3 h-3" />
                                    </div>
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-fuchsia-300/70 font-semibold">Reasoning Process</span>
                                    <div className="h-px flex-1 bg-fuchsia-900/30 mx-2"></div>
                                    <ChevronRight className="w-3 h-3 text-fuchsia-500/50 transition-transform duration-300 group-open:rotate-90" />
                                  </summary>
                                  <div className="px-5 py-4 text-[11px] text-slate-400 font-mono leading-relaxed border-t border-fuchsia-900/20 bg-slate-900/40 whitespace-pre-wrap">
                                    {msg.thought}
                                  </div>
                                </details>
                              </motion.div>
                            )}
                            
                            <div className={`relative group inline-block px-6 py-5 rounded-3xl text-[15px] leading-7 bg-[var(--bg-card)] backdrop-blur-sm border border-[var(--border-color)] text-[var(--text-primary)] w-full shadow-sm rounded-tl-sm hover:shadow-md transition-shadow duration-300`}>
                              {score && (
                                <div className={`absolute -top-3 left-4 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm flex items-center gap-1.5 ${
                                  score.toLowerCase() === 'high' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/50' :
                                  score.toLowerCase() === 'medium' ? 'bg-amber-950/50 text-amber-400 border-amber-900/50' :
                                  'bg-rose-950/50 text-rose-400 border-rose-900/50'
                                }`}>
                                  <Activity className="w-3 h-3" />
                                  Confidence: {score}
                                </div>
                              )}
                              <div className="markdown-body">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {cleanText}
                                </ReactMarkdown>
                              </div>

                              {chart && (
                                <div className="mt-6">
                                  <Visualization 
                                    type={chart.type as any} 
                                    data={chart.data} 
                                    title={chart.title} 
                                  />
                                </div>
                              )}

                              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                <button
                                  onClick={() => copyToClipboard(cleanText, idx)}
                                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors"
                                  title="Copy to clipboard"
                                >
                                  {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                                {idx === messages.length - 1 && !isLoading && (
                                  <button
                                    onClick={() => {
                                      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                                      if (lastUserMsg) {
                                        setMessages(prev => prev.slice(0, -1));
                                        handleSubmit(undefined, lastUserMsg.text);
                                      }
                                    }}
                                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors"
                                    title="Regenerate response"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </>
                        );
                      })()
                    )}
                    {msg.role === 'user' && (
                       <div className={`relative group inline-block px-6 py-5 rounded-3xl text-[15px] leading-7 bg-indigo-600 text-white shadow-xl shadow-indigo-900/20 rounded-tr-sm`}>
                          <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <button
                              onClick={() => copyToClipboard(msg.text, idx)}
                              className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              title="Copy message"
                            >
                              {copiedIndex === idx ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                       </div>
                    )}
                    {msg.role === 'model' && idx === messages.length - 1 && isLoading && (
                       <motion.div 
                         initial={{ opacity: 0, y: 5 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="mt-4 flex items-center gap-3 pl-2"
                       >
                         <div className="flex gap-1">
                           <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className={`w-1.5 h-1.5 rounded-full bg-${getModeTailwindColor(mode)}-400`} />
                           <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className={`w-1.5 h-1.5 rounded-full bg-${getModeTailwindColor(mode)}-400`} />
                           <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className={`w-1.5 h-1.5 rounded-full bg-${getModeTailwindColor(mode)}-400`} />
                         </div>
                         <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-medium">
                           {mode === 'design' ? 'GENERATING FORMULATION...' : 
                            mode === 'informatics' ? 'ANALYZING DATA...' : 
                            mode === 'eln' ? 'GENERATING PROTOCOL...' : 
                            mode === 'ml' ? 'TRAINING MODELS...' : 
                            mode === 'research' ? 'RESEARCHING...' : 
                            mode === 'regulatory' ? 'ANALYZING REGULATIONS...' : 
                            mode === 'project' ? 'PLANNING PROJECT...' : 
                            mode === 'integration' ? 'CONFIGURING...' : 'ORCHESTRATING...'}
                         </span>
                       </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {messages.length === 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="space-y-12 mt-8"
              >
                <div className="text-center space-y-4">
                  <div className="inline-flex p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 shadow-inner">
                    <Sparkles className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-[var(--text-primary)] tracking-tight">How can I help you today?</h3>
                  <p className="text-[var(--text-secondary)] max-w-lg mx-auto text-sm leading-relaxed">
                    Select a specialized assistant from the sidebar or try one of these common research tasks to get started.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {EXAMPLE_PROMPTS[mode].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSubmit(undefined, prompt)}
                      className="flex items-center gap-4 p-5 bg-[var(--bg-card)] backdrop-blur-sm border border-[var(--border-color)] rounded-2xl hover:shadow-xl hover:shadow-black/20 hover:border-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:-translate-y-0.5 transition-all duration-300 text-left group"
                    >
                      <div className={`p-3 rounded-xl transition-colors duration-300 bg-[var(--bg-sidebar)] shadow-sm ring-1 ring-[var(--border-color)] group-hover:bg-${getModeTailwindColor(mode)}-500/20 group-hover:text-${getModeTailwindColor(mode)}-400`}>
                        <Sparkles className="w-5 h-5 text-[var(--text-muted)] group-hover:text-current transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] leading-snug">{prompt}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} className="h-8" />
          </div>

          {/* Scroll to Bottom Button */}
          <AnimatePresence>
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={() => scrollToBottom()}
                className="fixed bottom-32 right-8 p-3 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-500/40 hover:bg-indigo-500 transition-all z-30 ring-1 ring-white/20"
                title="Scroll to bottom"
              >
                <ChevronRight className="w-5 h-5 rotate-90" />
              </motion.button>
            )}
          </AnimatePresence>
        </main>

        {/* Input Area */}
        <footer className="p-6 bg-[var(--bg-sidebar)] backdrop-blur-xl border-t border-[var(--border-color)] relative z-20">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-end gap-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-3xl p-2 shadow-lg shadow-black/20 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50 transition-all duration-300 hover:shadow-black/30 hover:bg-[var(--bg-card-hover)]">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  mode === 'design' ? "Describe your target application..." :
                  mode === 'informatics' ? "Ask about data extraction or trends..." :
                  mode === 'eln' ? "Describe the experiment or protocol you need..." :
                  mode === 'ml' ? "Describe your dataset or prediction goal..." :
                  mode === 'research' ? "Ask for literature search or writing help..." :
                  mode === 'regulatory' ? "Ask about regulations, standards, or testing..." :
                  mode === 'project' ? "Describe your project goals or timeline..." :
                  mode === 'integration' ? "Ask about profile setup or integrations..." :
                  "Describe your high-level research goals..."
                }
                className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-48 min-h-[52px] py-3.5 px-4 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] leading-relaxed"
                rows={1}
              />
              <button
                onClick={() => handleSubmit()}
                disabled={!input.trim() || isLoading}
                className={`p-3.5 rounded-2xl transition-all duration-200 mb-1 ${
                  !input.trim() || isLoading 
                    ? 'bg-[var(--bg-card)] text-[var(--text-muted)] cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-95'
                }`}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-4 px-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsThinking(!isThinking)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 text-[10px] font-mono uppercase tracking-widest border ${
                    isThinking 
                      ? 'bg-fuchsia-950/30 border-fuchsia-500/30 text-fuchsia-400 shadow-sm ring-1 ring-fuchsia-500/20' 
                      : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                  }`}
                  title="Enable Deep Thinking for complex reasoning (Ctrl+D)"
                >
                  <Brain className={`w-3 h-3 ${isThinking ? 'animate-pulse' : ''}`} />
                  Deep Thinking {isThinking ? 'ON' : 'OFF'}
                </button>
                <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-widest opacity-60">
                  AI can make mistakes. Verify experimentally.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-[var(--text-muted)] font-mono flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-[var(--text-muted)]"></div>
                  Markdown
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-[var(--text-muted)]"></div>
                  Shift+Enter
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {isRegistrationOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRegistrationOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 ring-1 ring-white/10"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-100">Join BioMat AI</h3>
                    <p className="text-sm text-slate-400 mt-1">Create your research profile to get started.</p>
                  </div>
                  <button 
                    onClick={() => setIsRegistrationOpen(false)}
                    className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsRegistrationOpen(false); }}>
                  <div className="space-y-1.5">
                    <label className="mono-label ml-1 text-slate-500">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Dr. Jane Doe"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-slate-200 placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="mono-label ml-1 text-slate-500">Institutional Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="email" 
                        placeholder="jane.doe@university.edu"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-slate-200 placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="mono-label ml-1 text-slate-500">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-slate-200 placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit"
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Create Account
                    </button>
                  </div>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                  <p className="text-xs text-slate-500">
                    Already have an account? 
                    <button className="ml-1 font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">Sign In</button>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
