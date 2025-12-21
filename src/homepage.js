import agentStore from './agentStore';

// Store cleanup functions using a WeakMap for proper memory management
const cleanupMap = new WeakMap();

export default function initHomepage() {
  const root = document.querySelector('.content');
  if (!root) return;

  // Clean up any previous subscription
  const previousCleanup = cleanupMap.get(root);
  if (previousCleanup) {
    previousCleanup();
  }

  root.innerHTML = '';

  // Create the two-column layout container
  const homeLayout = document.createElement('div');
  homeLayout.className = 'home-layout';

  // === LEFT SIDEBAR ===
  const sidebar = createSidebar();
  
  // === RIGHT MAIN SECTION ===
  const mainSection = createMainSection();

  homeLayout.appendChild(sidebar);
  homeLayout.appendChild(mainSection);
  root.appendChild(homeLayout);

  // Subscribe to agent store changes to keep UI in sync
  const unsubscribe = agentStore.subscribe((agents) => {
    updateSidebarAgentList(sidebar, agents);
    updateMainAgentCards(mainSection, agents);
  });

  // Initial render
  updateSidebarAgentList(sidebar, agentStore.getAgents());
  updateMainAgentCards(mainSection, agentStore.getAgents());

  // Store cleanup function using WeakMap for when page changes
  cleanupMap.set(root, unsubscribe);
}

function createSidebar() {
  const sidebar = document.createElement('aside');
  sidebar.className = 'team-sidebar';

  // Sidebar header with toggle
  const sidebarHeader = document.createElement('div');
  sidebarHeader.className = 'sidebar-header';

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'sidebar-toggle';
  toggleBtn.textContent = '☰';
  toggleBtn.title = 'Toggle sidebar';
  toggleBtn.setAttribute('aria-label', 'Toggle sidebar');
  
  const headerTitle = document.createElement('h2');
  headerTitle.className = 'sidebar-title';
  headerTitle.textContent = 'Team Members';

  sidebarHeader.appendChild(toggleBtn);
  sidebarHeader.appendChild(headerTitle);

  // Agent list container
  const agentList = document.createElement('ul');
  agentList.className = 'sidebar-agent-list';

  sidebar.appendChild(sidebarHeader);
  sidebar.appendChild(agentList);

  // Toggle sidebar collapse/expand
  let isCollapsed = false;
  toggleBtn.addEventListener('click', () => {
    isCollapsed = !isCollapsed;
    sidebar.classList.toggle('collapsed', isCollapsed);
    toggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
  });

  return sidebar;
}

function createMainSection() {
  const mainSection = document.createElement('main');
  mainSection.className = 'team-main';

  // Header with Add Agent button
  const mainHeader = document.createElement('div');
  mainHeader.className = 'main-header';

  const mainTitle = document.createElement('h1');
  mainTitle.textContent = 'Assemble Your Team';
  
  const addAgentBtn = document.createElement('button');
  addAgentBtn.className = 'add-agent-btn';
  addAgentBtn.textContent = '+ Add Agent';
  addAgentBtn.addEventListener('click', () => showAddAgentModal());

  mainHeader.appendChild(mainTitle);
  mainHeader.appendChild(addAgentBtn);

  // Agent cards container
  const agentCardsContainer = document.createElement('div');
  agentCardsContainer.className = 'agent-cards-container';

  mainSection.appendChild(mainHeader);
  mainSection.appendChild(agentCardsContainer);

  return mainSection;
}

function updateSidebarAgentList(sidebar, agents) {
  const agentList = sidebar.querySelector('.sidebar-agent-list');
  if (!agentList) return;

  agentList.innerHTML = '';

  if (agents.length === 0) {
    const emptyMsg = document.createElement('li');
    emptyMsg.className = 'sidebar-empty';
    emptyMsg.textContent = 'No agents yet';
    agentList.appendChild(emptyMsg);
    return;
  }

  agents.forEach(agent => {
    const li = document.createElement('li');
    li.className = 'sidebar-agent-item';
    
    const icon = document.createElement('span');
    icon.className = 'agent-icon';
    icon.textContent = agent.name.charAt(0);
    
    const info = document.createElement('div');
    info.className = 'agent-info';
    
    const name = document.createElement('span');
    name.className = 'agent-name';
    name.textContent = agent.name;
    
    const role = document.createElement('span');
    role.className = 'agent-role';
    role.textContent = agent.role;
    
    info.appendChild(name);
    info.appendChild(role);
    li.appendChild(icon);
    li.appendChild(info);
    
    agentList.appendChild(li);
  });
}

function updateMainAgentCards(mainSection, agents) {
  const container = mainSection.querySelector('.agent-cards-container');
  if (!container) return;

  container.innerHTML = '';

  if (agents.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    
    const emptyIcon = document.createElement('div');
    emptyIcon.className = 'empty-icon';
    emptyIcon.textContent = '👥';
    
    const emptyTitle = document.createElement('h3');
    emptyTitle.textContent = 'Start by adding agents to assemble your team.';
    
    const emptyText = document.createElement('p');
    emptyText.textContent = 'Click the "Add Agent" button above to create your first team member.';
    
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
    
    const avatar = document.createElement('div');
    avatar.className = 'agent-avatar';
    avatar.textContent = agent.name.charAt(0);
    
    cardHeader.appendChild(avatar);
    
    const cardBody = document.createElement('div');
    cardBody.className = 'agent-card-body';
    
    const name = document.createElement('h3');
    name.textContent = agent.name;
    
    const role = document.createElement('p');
    role.className = 'agent-card-role';
    role.textContent = agent.role;
    
    cardBody.appendChild(name);
    cardBody.appendChild(role);
    
    card.appendChild(cardHeader);
    card.appendChild(cardBody);
    
    container.appendChild(card);
  });
}

function showAddAgentModal() {
  // Check if modal already exists
  let modal = document.getElementById('add-agent-modal');
  if (modal) {
    modal.classList.add('show');
    return;
  }

  // Create modal
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

  const formGroup = document.createElement('div');
  formGroup.className = 'form-group';

  const label = document.createElement('label');
  label.textContent = 'Select Agent Role';
  label.setAttribute('for', 'agent-role-select');

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

  formGroup.appendChild(label);
  formGroup.appendChild(select);

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

  form.appendChild(formGroup);
  form.appendChild(formActions);
  modalBody.appendChild(form);

  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modal.appendChild(modalContent);

  document.body.appendChild(modal);

  // Show modal with animation using requestAnimationFrame for proper timing
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      modal.classList.add('show');
    });
  });

  // Event handlers
  const hideModal = () => {
    modal.classList.remove('show');
    // Wait for CSS transition to complete (300ms as defined in CSS)
    setTimeout(() => {
      modal.remove();
    }, 300);
  };

  closeBtn.addEventListener('click', hideModal);
  cancelBtn.addEventListener('click', hideModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      hideModal();
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const role = select.value;
    if (role) {
      agentStore.addAgent(role);
      hideModal();
    }
  });
}
