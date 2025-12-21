// Team member state management - single source of truth for all team members

// TEAM_MEMBER_ROLES defines the available roles for team members
const TEAM_MEMBER_ROLES = {
  DEVELOPER: 'Developer',
  DESIGNER: 'Designer',
  MANAGER: 'Manager',
  ANALYST: 'Analyst'
};

// Simple in-memory store for team members
let teamMembers = [];
let listeners = [];

// Subscribe to team member changes
function subscribe(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

// Notify all listeners of changes
function notifyListeners() {
  listeners.forEach(listener => listener(teamMembers));
}

// Add a new team member
function addTeamMember(teamMember) {
  const newTeamMember = {
    id: Date.now(),
    ...teamMember,
    createdAt: new Date().toISOString()
  };
  teamMembers = [...teamMembers, newTeamMember];
  notifyListeners();
  return newTeamMember;
}

// Remove a team member by ID
function removeTeamMember(id) {
  teamMembers = teamMembers.filter(member => member.id !== id);
  notifyListeners();
}

// Get all team members
function getTeamMembers() {
  return [...teamMembers];
}

// Get a single team member by ID
function getTeamMember(id) {
  return teamMembers.find(member => member.id === id);
}

export {
  TEAM_MEMBER_ROLES,
  subscribe,
  addTeamMember,
  removeTeamMember,
  getTeamMembers,
  getTeamMember
};
