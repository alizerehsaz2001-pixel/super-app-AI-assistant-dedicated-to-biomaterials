import React from 'react';
import { motion } from 'motion/react';
import { 
  FlaskConical, Database, ClipboardList, BrainCircuit, 
  BookOpen, Scale, KanbanSquare, Settings, LayoutGrid, 
  ArrowRight, Sparkles 
} from 'lucide-react';

export type Mode = 'home' | 'design' | 'informatics' | 'eln' | 'ml' | 'research' | 'regulatory' | 'project' | 'integration' | 'meta';

interface WelcomeDashboardProps {
  onSelectMode: (mode: Mode) => void;
}

const MODULES = [
  {
    id: 'design',
    title: 'Biomaterials Design',
    description: 'Design novel formulations (hydrogels, nanoparticles) with AI-driven suggestions for polymers, crosslinkers, and additives.',
    icon: FlaskConical,
    color: 'indigo'
  },
  {
    id: 'informatics',
    title: 'Materials Informatics',
    description: 'Extract data from literature, design schemas, and analyze structure-property relationships in biomaterials databases.',
    icon: Database,
    color: 'emerald'
  },
  {
    id: 'eln',
    title: 'ELN & LIMS',
    description: 'Generate experimental protocols, track samples, and manage laboratory workflows and inventory.',
    icon: ClipboardList,
    color: 'rose'
  },
  {
    id: 'ml',
    title: 'Machine Learning',
    description: 'Build predictive models, perform dimensionality reduction, and optimize experiments using active learning.',
    icon: BrainCircuit,
    color: 'violet'
  },
  {
    id: 'research',
    title: 'Research Assistant',
    description: 'Conduct intelligent literature reviews, draft manuscripts, and identify high-impact journals for publication.',
    icon: BookOpen,
    color: 'amber'
  },
  {
    id: 'regulatory',
    title: 'Regulatory Affairs',
    description: 'Navigate ISO standards, FDA/EMA pathways, and design biocompatibility testing strategies.',
    icon: Scale,
    color: 'sky'
  },
  {
    id: 'project',
    title: 'Project Management',
    description: 'Plan timelines, track milestones, manage budgets, and coordinate collaborative research projects.',
    icon: KanbanSquare,
    color: 'cyan'
  },
  {
    id: 'integration',
    title: 'Integration',
    description: 'Configure your research profile, connect external databases, and manage instrument integrations.',
    icon: Settings,
    color: 'orange'
  },
  {
    id: 'meta',
    title: 'Meta-Coordinator',
    description: 'Orchestrate complex workflows across multiple assistants for end-to-end research support.',
    icon: LayoutGrid,
    color: 'fuchsia'
  }
] as const;

export const WelcomeDashboard: React.FC<WelcomeDashboardProps> = ({ onSelectMode }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-16 space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-4"
        >
          <Sparkles className="w-4 h-4" />
          <span>Next-Gen Research OS</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl font-serif font-bold text-[var(--text-primary)] tracking-tight"
        >
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">BioMat AI</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed"
        >
          Your comprehensive AI partner for biomaterials discovery. Select a specialized module below to accelerate your research journey.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MODULES.map((module, index) => (
          <motion.button
            key={module.id}
            onClick={() => onSelectMode(module.id as Mode)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
            className="group relative flex flex-col p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden"
          >
            <div className={`absolute top-0 right-0 p-32 bg-${module.color}-500/5 blur-3xl rounded-full -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-100`} />
            
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-2xl bg-${module.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ring-1 ring-${module.color}-500/20`}>
                {React.createElement(module.icon, { 
                  className: `w-6 h-6 text-${module.color}-400` 
                })}
              </div>
              
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-indigo-300 transition-colors">
                {module.title}
              </h3>
              
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                {module.description}
              </p>
              
              <div className="mt-auto flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] group-hover:text-indigo-400 transition-colors">
                <span>Launch Module</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
