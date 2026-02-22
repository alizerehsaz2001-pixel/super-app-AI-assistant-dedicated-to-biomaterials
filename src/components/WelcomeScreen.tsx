import React from 'react';
import { motion } from 'motion/react';
import { 
  Beaker, 
  Database, 
  FlaskConical, 
  ClipboardList, 
  BrainCircuit, 
  BookOpen, 
  Scale, 
  KanbanSquare, 
  Settings, 
  LayoutGrid,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface WelcomeScreenProps {
  onSelectMode: (mode: any) => void;
}

const assistants = [
  {
    id: 'design',
    title: 'Biomaterials Design',
    subtitle: 'Formulation & Design',
    description: 'Design novel biomaterial formulations from concept to specifications.',
    icon: FlaskConical,
    color: 'indigo'
  },
  {
    id: 'informatics',
    title: 'Materials Informatics',
    subtitle: 'Data & Analytics',
    description: 'Extract, organize, and analyze biomaterials data from literature and experiments.',
    icon: Database,
    color: 'emerald'
  },
  {
    id: 'eln',
    title: 'ELN & LIMS',
    subtitle: 'Protocols & Tracking',
    description: 'Manage lab protocols, experiment tracking, and sample management.',
    icon: ClipboardList,
    color: 'rose'
  },
  {
    id: 'ml',
    title: 'Machine Learning',
    subtitle: 'Predictive Modeling',
    description: 'Build predictive models and use AI to accelerate materials discovery.',
    icon: BrainCircuit,
    color: 'violet'
  },
  {
    id: 'research',
    title: 'Research Assistant',
    subtitle: 'Literature & Writing',
    description: 'Literature review, scientific writing, and publication strategy support.',
    icon: BookOpen,
    color: 'amber'
  },
  {
    id: 'regulatory',
    title: 'Regulatory Affairs',
    subtitle: 'Compliance & Translation',
    description: 'Navigate ISO standards, FDA/EMA pathways, and biocompatibility testing.',
    icon: Scale,
    color: 'sky'
  },
  {
    id: 'project',
    title: 'Project Management',
    subtitle: 'Planning & Management',
    description: 'Plan timelines, track tasks, and manage resources for R&D projects.',
    icon: KanbanSquare,
    color: 'cyan'
  },
  {
    id: 'integration',
    title: 'Integration Specialist',
    subtitle: 'Profile & Integrations',
    description: 'Configure your profile and connect to external tools and databases.',
    icon: Settings,
    color: 'orange'
  },
  {
    id: 'meta',
    title: 'Meta-AI Coordinator',
    subtitle: 'Orchestration & Strategy',
    description: 'Orchestrate complex research projects across all specialized assistants.',
    icon: LayoutGrid,
    color: 'fuchsia'
  }
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectMode }) => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 space-y-6"
      >
        <div className="inline-flex p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 shadow-inner mb-4">
          <Beaker className="w-12 h-12 text-indigo-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--text-primary)] tracking-tight">
          Welcome to BioMat AI
        </h1>
        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          The ultimate Research OS for biomaterials scientists. Select a specialized assistant below to accelerate your research workflow.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assistants.map((assistant, index) => (
          <motion.button
            key={assistant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectMode(assistant.id)}
            className="group relative p-6 bg-[var(--bg-card)] backdrop-blur-sm border border-[var(--border-color)] rounded-3xl hover:shadow-2xl hover:shadow-black/20 hover:border-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:-translate-y-1 transition-all duration-300 text-left flex flex-col h-full"
          >
            <div className={`p-3 rounded-2xl mb-5 w-fit transition-colors duration-300 bg-[var(--bg-sidebar)] shadow-sm ring-1 ring-[var(--border-color)] group-hover:bg-${assistant.color}-500/20 group-hover:text-${assistant.color}-400`}>
              <assistant.icon className="w-6 h-6 text-[var(--text-muted)] group-hover:text-current transition-colors" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 group-hover:text-indigo-400 transition-colors">
                {assistant.title}
              </h3>
              <p className="text-[10px] font-mono uppercase tracking-widest text-indigo-500/70 font-bold mb-3">
                {assistant.subtitle}
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {assistant.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-semibold text-indigo-400">Launch Assistant</span>
              <ArrowRight className="w-4 h-4 text-indigo-400" />
            </div>
          </motion.button>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-20 p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-mono uppercase tracking-widest text-indigo-400 font-bold">Pro Tip</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] italic">
          "Use the Meta-AI Coordinator for complex projects that require collaboration between multiple specialists."
        </p>
      </motion.div>
    </div>
  );
};
