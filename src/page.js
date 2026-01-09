import agentStore from './agentStore';

export default function initPage() {
  const root = document.querySelector('.content');
  if (!root) return;

  root.innerHTML = '';

  // Create the layout container
  const teamAssemblyLayout = document.createElement('div');
  teamAssemblyLayout.className = 'team-assembly-layout';
  
  // Create setup selection section
  const setupSelection = createSetupSelection();
  
  teamAssemblyLayout.appendChild(setupSelection);
  root.appendChild(teamAssemblyLayout);
}

function createSetupSelection() {
  const container = document.createElement('div');
  container.className = 'setup-selection-container';
  
  // Setup type selector (tabs)
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'setup-tabs';
  
  const standardTab = document.createElement('button');
  standardTab.className = 'setup-tab active';
  standardTab.textContent = 'Standard Setup';
  standardTab.dataset.tab = 'standard';
  
  const customTab = document.createElement('button');
  customTab.className = 'setup-tab';
  customTab.textContent = 'Custom Setup';
  customTab.dataset.tab = 'custom';
  
  tabsContainer.appendChild(standardTab);
  tabsContainer.appendChild(customTab);
  
  // Content containers
  const contentContainer = document.createElement('div');
  contentContainer.className = 'setup-content-container';
  
  const standardContent = createStandardSetupContent();
  standardContent.className = 'setup-content active';
  standardContent.dataset.content = 'standard';
  
  const customContent = createCustomSetupContent();
  customContent.className = 'setup-content';
  customContent.dataset.content = 'custom';
  
  contentContainer.appendChild(standardContent);
  contentContainer.appendChild(customContent);
  
  container.appendChild(tabsContainer);
  container.appendChild(contentContainer);
  
  // Tab switching logic
  const tabs = [standardTab, customTab];
  const contents = [standardContent, customContent];
  
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      contents[index].classList.add('active');
    });
  });
  
  return container;
}

function createStandardSetupContent() {
  const content = document.createElement('div');
  
  const intro = document.createElement('p');
  intro.className = 'standard-intro';
  intro.textContent = 'Select a pre-configured team template based on your task or project type:';
  
  const templatesGrid = document.createElement('div');
  templatesGrid.className = 'templates-grid';
  
  const templates = agentStore.getStandardTeams();
  const activeTemplateId = agentStore.getActiveTemplateId();
  
  templates.forEach(template => {
    const card = document.createElement('article');
    card.className = 'template-card';
    
    const isActive = template.id === activeTemplateId;
    if (isActive) {
      card.classList.add('active');
    }
    
    // Active badge
    if (isActive) {
      const activeBadge = document.createElement('div');
      activeBadge.className = 'active-badge';
      activeBadge.textContent = 'Active';
      card.appendChild(activeBadge);
    }
    
    const cardIcon = document.createElement('div');
    cardIcon.className = 'template-icon';
    cardIcon.textContent = template.icon;
    
    const cardBody = document.createElement('div');
    cardBody.className = 'template-body';
    
    const cardTitle = document.createElement('h3');
    cardTitle.className = 'template-title';
    cardTitle.textContent = template.name;
    
    const cardDescription = document.createElement('p');
    cardDescription.className = 'template-description';
    cardDescription.textContent = template.description;
    
    const rolesContainer = document.createElement('div');
    rolesContainer.className = 'template-roles';
    
    const rolesLabel = document.createElement('span');
    rolesLabel.className = 'roles-label';
    rolesLabel.textContent = 'Team includes:';
    
    const rolesList = document.createElement('ul');
    rolesList.className = 'roles-list';
    
    template.roles.forEach(role => {
      const roleItem = document.createElement('li');
      roleItem.className = 'role-item';
      roleItem.textContent = role;
      rolesList.appendChild(roleItem);
    });
    
    rolesContainer.appendChild(rolesLabel);
    rolesContainer.appendChild(rolesList);
    
    const selectBtn = document.createElement('button');
    selectBtn.className = 'template-select-btn';
    
    if (isActive) {
      selectBtn.classList.add('active');
      selectBtn.innerHTML = '✓ Currently Active';
      selectBtn.disabled = true;
    } else {
      selectBtn.textContent = 'Use This Team';
      selectBtn.addEventListener('click', () => {
        showConfirmationModal(
          `Create a team for "${template.name}"? This will replace your current team.`,
          () => {
            agentStore.createStandardTeam(template.id);
            // Navigate to home
            const homeLink = document.getElementById('home-link');
            if (homeLink) homeLink.click();
          }
        );
      });
    }
    
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardDescription);
    cardBody.appendChild(rolesContainer);
    cardBody.appendChild(selectBtn);
    
    card.appendChild(cardIcon);
    card.appendChild(cardBody);
    
    templatesGrid.appendChild(card);
  });
  
  content.appendChild(intro);
  content.appendChild(templatesGrid);
  
  return content;
}

function createCustomSetupContent() {
  const content = document.createElement('div');
  
  // Intro section with button
  const introSection = document.createElement('div');
  introSection.className = 'custom-intro-section';
  
  const intro = document.createElement('p');
  intro.className = 'custom-intro';
  intro.textContent = 'Build your team by selecting individual agents with specific roles:';
  
  // Add Agent button
  const addAgentBtn = document.createElement('button');
  addAgentBtn.className = 'add-agent-btn-large';
  addAgentBtn.innerHTML = '<span class="btn-icon">+</span> Add Agent';
  addAgentBtn.addEventListener('click', () => showAddAgentModal());
  
  introSection.appendChild(intro);
  introSection.appendChild(addAgentBtn);
  
  const customSection = document.createElement('div');
  customSection.className = 'custom-assembly-section';
  
  // Current team display
  const currentTeamContainer = document.createElement('div');
  currentTeamContainer.className = 'current-team-container';
  
  const currentTeamTitle = document.createElement('h3');
  currentTeamTitle.className = 'current-team-title';
  currentTeamTitle.textContent = 'Current Team';
  
  const agentCardsContainer = document.createElement('div');
  agentCardsContainer.className = 'agent-cards-container';
  
  currentTeamContainer.appendChild(currentTeamTitle);
  currentTeamContainer.appendChild(agentCardsContainer);
  
  customSection.appendChild(currentTeamContainer);
  
  content.appendChild(introSection);
  content.appendChild(customSection);
  
  // Subscribe to agent store changes
  const unsubscribe = agentStore.subscribe((agents) => {
    updateAgentCards(agentCardsContainer, agents);
  });
  
  // Initial render
  updateAgentCards(agentCardsContainer, agentStore.getAgents());
  
  return content;
}

function updateAgentCards(container, agents) {
  container.innerHTML = '';
  
  if (agents.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    
    const emptyIcon = document.createElement('div');
    emptyIcon.className = 'empty-icon';
    emptyIcon.textContent = '👥';
    
    const emptyTitle = document.createElement('h3');
    emptyTitle.textContent = 'No agents added yet';
    
    const emptyText = document.createElement('p');
    emptyText.textContent = 'Click "Add Agent" to start building your custom team.';
    
    emptyState.appendChild(emptyIcon);
    emptyState.appendChild(emptyTitle);
    emptyState.appendChild(emptyText);
    
    container.appendChild(emptyState);
    return;
  }
  
  agents.forEach(agent => {
    const card = document.createElement('article');
    card.className = 'agent-card';
    
    const cardHeader = document.createElement('div');
    cardHeader.className = 'agent-card-header';
    
    // Apply role-specific color
    const roleColor = agentStore.getRoleColor(agent.role);
    cardHeader.style.background = `linear-gradient(135deg, ${roleColor.primary}, ${roleColor.secondary})`;
    
    const avatar = document.createElement('div');
    avatar.className = 'agent-avatar';
    avatar.textContent = agent.name.charAt(0);
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-agent-card-btn';
    removeBtn.innerHTML = '×';
    removeBtn.setAttribute('aria-label', `Remove ${agent.name}`);
    removeBtn.title = 'Remove agent';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showConfirmationModal(
        `Are you sure you want to remove ${agent.name} from the team?`,
        () => agentStore.removeAgent(agent.id)
      );
    });
    
    cardHeader.appendChild(avatar);
    cardHeader.appendChild(removeBtn);
    
    const cardBody = document.createElement('div');
    cardBody.className = 'agent-card-body';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'agent-card-name-input';
    nameInput.value = agent.name;
    nameInput.placeholder = agent.role;
    nameInput.setAttribute('aria-label', `Edit name for ${agent.name}`);
    
    const role = document.createElement('p');
    role.className = 'agent-card-role';
    role.textContent = agent.role;
    
    // Handle name editing
    let originalValue = agent.name;
    
    nameInput.addEventListener('focus', () => {
      originalValue = nameInput.value;
      card.classList.add('editing');
    });
    
    nameInput.addEventListener('blur', () => {
      card.classList.remove('editing');
      const newName = nameInput.value.trim();
      if (newName && newName !== originalValue) {
        agentStore.updateAgentName(agent.id, newName);
      } else if (!newName) {
        nameInput.value = originalValue;
      }
    });
    
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        nameInput.blur();
      } else if (e.key === 'Escape') {
        nameInput.value = originalValue;
        nameInput.blur();
      }
    });
    
    cardBody.appendChild(nameInput);
    cardBody.appendChild(role);
    
    card.appendChild(cardHeader);
    card.appendChild(cardBody);
    
    container.appendChild(card);
  });
}

function showConfirmationModal(message, onConfirm) {
  const modal = document.createElement('div');
  modal.className = 'modal confirmation-modal';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content confirmation-content';

  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = 'Confirm Action';
  
  modalHeader.appendChild(modalTitle);

  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';

  const messageText = document.createElement('p');
  messageText.className = 'confirmation-message';
  messageText.textContent = message;

  modalBody.appendChild(messageText);

  const modalFooter = document.createElement('div');
  modalFooter.className = 'modal-footer';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-secondary';
  cancelBtn.textContent = 'Cancel';

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn btn-danger';
  confirmBtn.textContent = 'Remove';

  modalFooter.appendChild(cancelBtn);
  modalFooter.appendChild(confirmBtn);

  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modalContent.appendChild(modalFooter);
  modal.appendChild(modalContent);

  document.body.appendChild(modal);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      modal.classList.add('show');
      confirmBtn.focus();
    });
  });

  const hideModal = () => {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  };

  const handleConfirm = () => {
    hideModal();
    if (onConfirm) onConfirm();
  };

  cancelBtn.addEventListener('click', hideModal);
  confirmBtn.addEventListener('click', handleConfirm);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
  });

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') hideModal();
    else if (e.key === 'Enter') handleConfirm();
  };
  
  document.addEventListener('keydown', handleKeyDown);
  modal.addEventListener('remove', () => {
    document.removeEventListener('keydown', handleKeyDown);
  });
}

function showAddAgentModal() {
  let modal = document.getElementById('add-agent-modal');
  if (modal) {
    modal.classList.add('show');
    return;
  }

  modal = document.createElement('div');
  modal.id = 'add-agent-modal';
  modal.className = 'modal';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = 'Add New Agent';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Close modal');
  
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeBtn);

  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';

  const form = document.createElement('form');
  form.className = 'add-agent-form';

  const roleFormGroup = document.createElement('div');
  roleFormGroup.className = 'form-group';

  const roleLabel = document.createElement('label');
  roleLabel.textContent = 'Select Agent Role';
  roleLabel.setAttribute('for', 'agent-role-select');

  const select = document.createElement('select');
  select.id = 'agent-role-select';
  select.className = 'agent-role-select';
  select.required = true;

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Choose a role...';
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);

  agentStore.getRoles().forEach(role => {
    const option = document.createElement('option');
    option.value = role;
    option.textContent = role;
    select.appendChild(option);
  });

  roleFormGroup.appendChild(roleLabel);
  roleFormGroup.appendChild(select);

  // Name input field
  const nameFormGroup = document.createElement('div');
  nameFormGroup.className = 'form-group';

  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Agent Name (Optional)';
  nameLabel.setAttribute('for', 'agent-name-input');

  const nameInput = document.createElement('input');
  nameInput.id = 'agent-name-input';
  nameInput.type = 'text';
  nameInput.className = 'agent-name-input';
  nameInput.placeholder = 'e.g., Sarah Chen';

  const nameHelpText = document.createElement('small');
  nameHelpText.className = 'form-help-text';
  nameHelpText.textContent = 'Leave blank to use role name';
  nameHelpText.style.color = '#6b7280';
  nameHelpText.style.fontSize = '0.85rem';
  nameHelpText.style.marginTop = '4px';

  nameFormGroup.appendChild(nameLabel);
  nameFormGroup.appendChild(nameInput);
  nameFormGroup.appendChild(nameHelpText);

  form.appendChild(roleFormGroup);
  form.appendChild(nameFormGroup);

  // Auto-suggest name when role is selected
  select.addEventListener('change', () => {
    if (select.value && !nameInput.value.trim()) {
      nameInput.value = agentStore.getSuggestedName();
      nameInput.select(); // Highlight the suggested name for easy editing
    }
  });

  const formActions = document.createElement('div');
  formActions.className = 'form-actions';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn btn-secondary';
  cancelBtn.textContent = 'Cancel';

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary';
  submitBtn.textContent = 'Add Agent';

  formActions.appendChild(cancelBtn);
  formActions.appendChild(submitBtn);

  form.appendChild(formActions);
  modalBody.appendChild(form);

  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modal.appendChild(modalContent);

  document.body.appendChild(modal);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => modal.classList.add('show'));
  });

  const hideModal = () => {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  };

  closeBtn.addEventListener('click', hideModal);
  cancelBtn.addEventListener('click', hideModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const role = select.value;
    const customName = nameInput.value.trim();
    if (role) {
      agentStore.addAgent(role, customName || null);
      hideModal();
    }
  });
}
