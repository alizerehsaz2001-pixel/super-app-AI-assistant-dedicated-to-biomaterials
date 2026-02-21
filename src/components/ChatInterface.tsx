import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Bot, User, Loader2, Beaker, RotateCcw, Copy, Check, Sparkles, Database, FlaskConical, ClipboardList, BrainCircuit } from 'lucide-react';
import { streamChatResponse } from '../services/gemini';
import { DESIGN_SYSTEM_INSTRUCTION, INFORMATICS_SYSTEM_INSTRUCTION, ELN_SYSTEM_INSTRUCTION, ML_SYSTEM_INSTRUCTION } from '../constants';

interface Message {
  role: 'user' | 'model';
  text: string;
}

type Mode = 'design' | 'informatics' | 'eln' | 'ml';

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
  ]
};

export default function ChatInterface() {
  const [mode, setMode] = useState<Mode>('design');
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGES.design]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    try {
      // Create a placeholder for the model response
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      const stream = streamChatResponse([...messages, userMessage], systemInstruction);
      
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', text: fullResponse };
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

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getModeColor = (m: Mode) => {
    switch (m) {
      case 'design': return 'indigo';
      case 'informatics': return 'emerald';
      case 'eln': return 'rose';
      case 'ml': return 'violet';
    }
  };

  const getModeIcon = (m: Mode) => {
    switch (m) {
      case 'design': return <FlaskConical className="w-6 h-6 text-white" />;
      case 'informatics': return <Database className="w-6 h-6 text-white" />;
      case 'eln': return <ClipboardList className="w-6 h-6 text-white" />;
      case 'ml': return <BrainCircuit className="w-6 h-6 text-white" />;
    }
  };

  const getModeTitle = (m: Mode) => {
    switch (m) {
      case 'design': return 'Biomaterials Design Assistant';
      case 'informatics': return 'Materials Informatics Specialist';
      case 'eln': return 'ELN & LIMS Assistant';
      case 'ml': return 'Machine Learning Specialist';
    }
  };

  const getModeSubtitle = (m: Mode) => {
    switch (m) {
      case 'design': return 'Formulation & Design';
      case 'informatics': return 'Data & Analytics';
      case 'eln': return 'Protocols & Tracking';
      case 'ml': return 'Predictive Modeling & AI';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-stone-200 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg transition-colors bg-${getModeColor(mode)}-600`}>
            {getModeIcon(mode)}
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              {getModeTitle(mode)}
            </h1>
            <p className="text-xs text-stone-500 font-mono uppercase tracking-wider">v1.3.0 • {getModeSubtitle(mode)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-lg border border-stone-200 overflow-x-auto max-w-[400px] md:max-w-none">
          {(['design', 'informatics', 'eln', 'ml'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all capitalize whitespace-nowrap ${
                mode === m
                  ? `bg-white text-${getModeColor(m)}-600 shadow-sm` 
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {m === 'ml' ? 'ML & AI' : m}
            </button>
          ))}
        </div>

        <button 
          onClick={handleReset}
          className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
          title="Reset Conversation"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' 
                  ? 'bg-stone-200 text-stone-600' 
                  : `bg-${getModeColor(mode)}-600 text-white`
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Content */}
              <div className={`flex-1 max-w-[85%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`relative group inline-block px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-white border border-stone-200 text-stone-800' 
                    : 'bg-white border border-stone-200 text-stone-800 w-full'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <>
                      <div className={`prose prose-stone prose-sm max-w-none prose-headings:font-semibold prose-h2:text-stone-900 prose-code:text-indigo-600 prose-pre:bg-stone-900 prose-pre:text-stone-50 prose-a:text-${getModeColor(mode)}-600`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                      <button
                        onClick={() => copyToClipboard(msg.text, idx)}
                        className="absolute top-2 right-2 p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === idx ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </>
                  )}
                </div>
                {msg.role === 'model' && idx === messages.length - 1 && isLoading && (
                   <div className="mt-2 flex items-center gap-2 text-xs text-stone-400 font-mono animate-pulse">
                     <Loader2 className="w-3 h-3 animate-spin" />
                     {mode === 'design' ? 'GENERATING FORMULATION...' : 
                      mode === 'informatics' ? 'ANALYZING DATA...' : 
                      mode === 'eln' ? 'GENERATING PROTOCOL...' : 'TRAINING MODELS...'}
                   </div>
                )}
              </div>
            </div>
          ))}
          
          {messages.length === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {EXAMPLE_PROMPTS[mode].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit(undefined, prompt)}
                  className={`flex items-center gap-3 p-4 bg-white border border-stone-200 rounded-xl hover:shadow-md transition-all text-left group hover:border-${getModeColor(mode)}-300`}
                >
                  <div className={`p-2 rounded-lg transition-colors bg-${getModeColor(mode)}-50 text-${getModeColor(mode)}-600 group-hover:bg-${getModeColor(mode)}-100`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">{prompt}</span>
                </button>
              ))}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-white border-t border-stone-200">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-2 bg-stone-50 border border-stone-300 rounded-xl p-2 focus-within:ring-2 focus-within:border-transparent transition-all shadow-sm focus-within:ring-stone-400">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === 'design' ? "Describe your target application..." :
                mode === 'informatics' ? "Ask about data extraction or trends..." :
                mode === 'eln' ? "Describe the experiment or protocol you need..." :
                "Describe your dataset or prediction goal..."
              }
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-48 min-h-[44px] py-2.5 px-2 text-sm text-stone-800 placeholder:text-stone-400"
              rows={1}
            />
            <button
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isLoading}
              className="p-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-0.5"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-center text-xs text-stone-400 mt-3 font-mono">
            AI can make mistakes. Verify all formulations experimentally.
          </p>
        </div>
      </footer>
    </div>
  );
}
