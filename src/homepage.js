import { TEAM_MEMBER_ROLES, subscribe, addTeamMember, removeTeamMember, getTeamMembers } from './teamMemberStore';

export default function initHomepage() {
  const root = document.querySelector('.content');
  if (!root) return;

  root.innerHTML = '';

  // Create header with Add Team Member button
  const header = document.createElement('div');
  header.className = 'team-header';
  
  const title = document.createElement('h2');
  title.textContent = 'Team Members';
  
  const addButton = document.createElement('button');
  addButton.className = 'add-team-member-btn';
  addButton.textContent = '+ Add Team Member';
  addButton.addEventListener('click', showAddTeamMemberModal);
  
  header.appendChild(title);
  header.appendChild(addButton);
  root.appendChild(header);

  // Create container for team members list
  const teamMembersList = document.createElement('div');
  teamMembersList.className = 'team-members-list';
  teamMembersList.id = 'team-members-list';
  root.appendChild(teamMembersList);

  // Render team members
  function renderTeamMembers() {
    const members = getTeamMembers();
    teamMembersList.innerHTML = '';
    
    if (members.length === 0) {
      // Empty state
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      
      const emptyIcon = document.createElement('div');
      emptyIcon.className = 'empty-icon';
      emptyIcon.textContent = '👥';
      
      const emptyTitle = document.createElement('h3');
      emptyTitle.textContent = 'No team members yet';
      
      const emptyText1 = document.createElement('p');
      emptyText1.textContent = 'Start by adding team members to assemble your team.';
      
      const emptyText2 = document.createElement('p');
      emptyText2.textContent = 'Click the "Add Team Member" button above to create your first team member.';
      
      emptyState.appendChild(emptyIcon);
      emptyState.appendChild(emptyTitle);
      emptyState.appendChild(emptyText1);
      emptyState.appendChild(emptyText2);
      teamMembersList.appendChild(emptyState);
    } else {
      // Render member cards
      members.forEach(member => {
        const card = document.createElement('div');
        card.className = 'team-member-card';
        
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';
        
        const memberName = document.createElement('h3');
        memberName.textContent = member.name;
        
        const memberRole = document.createElement('span');
        memberRole.className = 'member-role';
        memberRole.textContent = member.role;
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.textContent = '×';
        deleteButton.addEventListener('click', () => {
          removeTeamMember(member.id);
        });
        
        cardHeader.appendChild(memberName);
        cardHeader.appendChild(memberRole);
        cardHeader.appendChild(deleteButton);
        card.appendChild(cardHeader);
        
        teamMembersList.appendChild(card);
      });
    }
  }

  // Subscribe to team member changes
  subscribe(renderTeamMembers);
  
  // Initial render
  renderTeamMembers();

  // Show modal for adding team member
  function showAddTeamMemberModal() {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'add-team-member-modal';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = 'Add New Team Member';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'close-btn';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', closeModal);
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    // Create form
    const form = document.createElement('form');
    form.className = 'add-team-member-form';
    form.addEventListener('submit', handleFormSubmit);
    
    // Name input
    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';
    
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Name';
    nameLabel.setAttribute('for', 'team-member-name');
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'team-member-name';
    nameInput.name = 'name';
    nameInput.required = true;
    nameInput.placeholder = 'Enter team member name';
    
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    
    // Role select
    const roleGroup = document.createElement('div');
    roleGroup.className = 'form-group';
    
    const roleLabel = document.createElement('label');
    roleLabel.textContent = 'Select Team Member Role';
    roleLabel.setAttribute('for', 'team-member-role-select');
    
    const roleSelect = document.createElement('select');
    roleSelect.id = 'team-member-role-select';
    roleSelect.className = 'team-member-role-select';
    roleSelect.name = 'role';
    roleSelect.required = true;
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a role...';
    roleSelect.appendChild(defaultOption);
    
    // Add role options
    Object.entries(TEAM_MEMBER_ROLES).forEach(([key, value]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      roleSelect.appendChild(option);
    });
    
    roleGroup.appendChild(roleLabel);
    roleGroup.appendChild(roleSelect);
    
    // Submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'submit-btn';
    submitButton.textContent = 'Add Team Member';
    
    form.appendChild(nameGroup);
    form.appendChild(roleGroup);
    form.appendChild(submitButton);
    
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(form);
    modalOverlay.appendChild(modalContent);
    
    document.body.appendChild(modalOverlay);
    
    // Close modal when clicking overlay
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
    
    // Focus on name input after modal is added to DOM
    const MODAL_RENDER_DELAY = 100;
    setTimeout(() => nameInput.focus(), MODAL_RENDER_DELAY);
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const role = formData.get('role');
    
    if (name && role) {
      addTeamMember({ name, role });
      closeModal();
    }
  }

  function closeModal() {
    const modal = document.getElementById('add-team-member-modal');
    if (modal) {
      modal.remove();
    }
  }
}
