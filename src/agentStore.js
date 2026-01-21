// Agent state management - single source of truth for all agents

const AGENT_ROLES = [
  'Data Analyst',
  'Project Manager',
  'Martech User',
  'Martech Manager',
  'Architect',
  'Data Engineer'
];

// Role color mapping for consistent UI
const ROLE_COLORS = {
  'Data Analyst': { primary: '#8b5cf6', secondary: '#a78bfa' },      // Purple
  'Project Manager': { primary: '#ef4444', secondary: '#f87171' },   // Red
  'Martech User': { primary: '#06b6d4', secondary: '#22d3ee' },      // Cyan
  'Martech Manager': { primary: '#f59e0b', secondary: '#fbbf24' },   // Amber
  'Architect': { primary: '#10b981', secondary: '#34d399' },         // Green
  'Data Engineer': { primary: '#2563eb', secondary: '#60a5fa' }      // Blue
};

const STORAGE_KEY = 'app-alpha-agents';

// Name suggestions pool
const NAME_POOL = [
  'Sarah Chen', 'Marcus Rodriguez', 'Priya Patel', 'James Williams',
  'Emily Johnson', 'David Kim', 'Maria Garcia', 'Alex Thompson',
  'Jessica Martinez', 'Diksha Yadav' ,'Michael Lee', 'Rachel Cohen', 'Kevin Zhang',
  'Aisha Osman', 'Chris Anderson', 'Nina Sharma', 'Ryan O\'Brien',
  'Jasmine Wong', 'Daniel Brown', 'Sophia Nguyen', 'Tyler Jackson',
  'Maya Desai', 'Jordan Taylor', 'Lauren Davis', 'Eric Wilson',
  'Samantha Moore', 'Brandon Harris', 'Olivia Martin', 'Justin Clark'
];

// Track used names to avoid duplicates
let usedNames = new Set();

// Standard team templates for different tasks
const STANDARD_TEAMS = [
  {
    id: 'data-migration',
    name: 'Data Migration Project',
    description: 'Migrate data from legacy systems to modern platforms',
    icon: '🔀',
    roles: ['Data Engineer', 'Data Analyst', 'Architect', 'Project Manager']
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Campaign',
    description: 'Plan and execute marketing campaigns with analytics',
    icon: '📊',
    roles: ['Martech Manager', 'Martech User', 'Data Analyst', 'Project Manager']
  },
  {
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    description: 'Build comprehensive data analytics and reporting dashboards',
    icon: '📈',
    roles: ['Data Analyst', 'Data Engineer', 'Architect']
  },
  {
    id: 'platform-integration',
    name: 'Platform Integration',
    description: 'Integrate multiple platforms and ensure data consistency',
    icon: '🔌',
    roles: ['Architect', 'Data Engineer', 'Martech Manager', 'Project Manager']
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis & Insights',
    description: 'Analyze data to derive actionable business insights',
    icon: '🔍',
    roles: ['Data Analyst', 'Data Engineer']
  },
  {
    id: 'full-stack',
    name: 'Full Stack Team',
    description: 'Complete team with all roles for complex projects',
    icon: '🚀',
    roles: ['Project Manager', 'Architect', 'Data Engineer', 'Data Analyst', 'Martech Manager', 'Martech User']
  }
];

class AgentStore {
  constructor() {
    this.agents = [];
    this.approver = { id: 'human-approver', name: 'You' };
    this.listeners = [];
    this.nextId = 1;
    this.activeTemplateId = null;
    this.loadFromStorage();
  }

  // Load state from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.agents = data.agents || [];
        this.approver = data.approver || { id: 'human-approver', name: 'You' };
        this.nextId = data.nextId || 1;
        this.activeTemplateId = data.activeTemplateId || null;
        
        // Rebuild used names set
        usedNames.clear();
        this.agents.forEach(agent => {
          if (agent.name && NAME_POOL.includes(agent.name)) {
            usedNames.add(agent.name);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load state from localStorage:', error);
      // Continue with empty state if loading fails
    }
  }

  // Save state to localStorage
  saveToStorage() {
    try {
      const data = {
        agents: this.agents,
        approver: this.approver,
        nextId: this.nextId,
        activeTemplateId: this.activeTemplateId
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
    }
  }

  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners of state change
  notify() {
    this.listeners.forEach(listener => listener(this.agents));
    this.saveToStorage();
  }

  // Add a new agent
  addAgent(role, customName = null) {
    const agent = {
      id: this.nextId++,
      name: customName && customName.trim() ? customName.trim() : role,
      role: role,
      // AI-related fields
      conversationHistory: [],
      temperature: 0.7,
    };
    this.agents.push(agent);
    
    // Track if using a name from pool
    if (NAME_POOL.includes(agent.name)) {
      usedNames.add(agent.name);
    }
    
    this.notify();
    return agent;
  }

  // Get a suggested name (unused from pool)
  getSuggestedName() {
    const availableNames = NAME_POOL.filter(name => !usedNames.has(name));
    if (availableNames.length > 0) {
      return availableNames[Math.floor(Math.random() * availableNames.length)];
    }
    // If all names used, pick random from full pool
    return NAME_POOL[Math.floor(Math.random() * NAME_POOL.length)];
  }

  // Update agent name
  updateAgentName(id, newName) {
    const agent = this.agents.find(a => a.id === id);
    if (agent && newName && newName.trim()) {
      agent.name = newName.trim();
      this.notify();
      return true;
    }
    return false;
  }

  // Remove an agent by id
  removeAgent(id) {
    const index = this.agents.findIndex(a => a.id === id);
    if (index > -1) {
      const agent = this.agents[index];
      // Free up the name if it was from pool
      if (NAME_POOL.includes(agent.name)) {
        usedNames.delete(agent.name);
      }
      this.agents.splice(index, 1);
      this.notify();
      return true;
    }
    return false;
  }

  // Get all agents
  getAgents() {
    return [...this.agents];
  }

  // Get available roles
  getRoles() {
    return [...AGENT_ROLES];
  }

  // Get approver
  getApprover() {
    return { ...this.approver };
  }

  // Update approver name
  updateApproverName(name) {
    if (name && name.trim()) {
      this.approver.name = name.trim();
      this.notify();
      return true;
    }
    return false;
  }

  // Clear all agents (useful for reset)
  clearAllAgents() {
    this.agents = [];
    this.nextId = 1;
    usedNames.clear();
    this.notify();
  }

  // Get standard team templates
  getStandardTeams() {
    return [...STANDARD_TEAMS];
  }

  // Create a standard team based on template
  createStandardTeam(templateId) {
    const template = STANDARD_TEAMS.find(t => t.id === templateId);
    if (!template) return false;

    // Clear existing agents
    this.clearAllAgents();

    // Add agents for each role in the template with auto-generated names
    template.roles.forEach(role => {
      const suggestedName = this.getSuggestedName();
      this.addAgent(role, suggestedName);
    });

    // Set this template as active
    this.activeTemplateId = templateId;
    this.saveToStorage();

    return true;
  }

  // Get active template ID
  getActiveTemplateId() {
    return this.activeTemplateId;
  }

  // Get color for a role
  getRoleColor(role) {
    return ROLE_COLORS[role] || { primary: '#2563eb', secondary: '#60a5fa' };
  }

  // Add message to agent's conversation history
  addToConversationHistory(agentId, message) {
    const agent = this.agents.find(a => a.id === agentId);
    if (agent) {
      if (!agent.conversationHistory) {
        agent.conversationHistory = [];
      }
      agent.conversationHistory.push(message);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Get agent's conversation history
  getConversationHistory(agentId) {
    const agent = this.agents.find(a => a.id === agentId);
    return agent?.conversationHistory || [];
  }

  // Clear agent's conversation history
  clearConversationHistory(agentId) {
    const agent = this.agents.find(a => a.id === agentId);
    if (agent) {
      agent.conversationHistory = [];
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Update agent temperature setting
  updateAgentTemperature(agentId, temperature) {
    const agent = this.agents.find(a => a.id === agentId);
    if (agent && temperature >= 0 && temperature <= 1) {
      agent.temperature = temperature;
      this.saveToStorage();
      return true;
    }
    return false;
  }
}

// Export a singleton instance
export default new AgentStore();
