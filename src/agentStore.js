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

class AgentStore {
  constructor() {
    this.agents = [];
    this.approver = { id: 'human-approver', name: 'You' };
    this.listeners = [];
    this.nextId = 1;
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
        nextId: this.nextId
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
}

// Export a singleton instance
export default new AgentStore();
