// Agent state management - single source of truth for all agents
const AGENT_ROLES = [
  'Data Analyst',
  'Project Manager',
  'Martech User',
  'Martech Manager',
  'Architect',
  'Data Engineer'
];

const STORAGE_KEY = 'app-alpha-agents';

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
  addAgent(role) {
    const roleCount = this.agents.filter(a => a.role === role).length;
    const agent = {
      id: this.nextId++,
      name: `${role} ${roleCount + 1}`,
      role: role
    };
    this.agents.push(agent);
    this.notify();
    return agent;
  }

  // Remove an agent by id
  removeAgent(id) {
    const index = this.agents.findIndex(a => a.id === id);
    if (index > -1) {
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

    // Add agents for each role in the template
    template.roles.forEach(role => {
      this.addAgent(role);
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
}

// Export a singleton instance
export default new AgentStore();
