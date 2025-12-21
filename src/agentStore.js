// Agent state management - single source of truth for all agents
const AGENT_ROLES = [
  'Data Analyst',
  'Project Manager',
  'Martech User',
  'Martech Manager',
  'Architect',
  'Data Engineer'
];

class AgentStore {
  constructor() {
    this.agents = [];
    this.listeners = [];
    this.nextId = 1;
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
}

// Export a singleton instance
export default new AgentStore();
