import agentStore from './agentStore';
import { geminiService } from './geminiService';

// Store cleanup functions using a WeakMap for proper memory management
const cleanupMap = new WeakMap();

// Track selected agent and chat history
let selectedAgent = null;
const chatHistory = {}; // Format: { agentId: [{ text, sender, timestamp }] }

// Load chat history from localStorage
function loadChatHistory() {
  const saved = localStorage.getItem('chatHistory');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.assign(chatHistory, parsed);
    } catch (e) {
      console.error('Failed to load chat history', e);
    }
  }
}

// Save chat history to localStorage
function saveChatHistory() {
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

export default function initHomepage() {
  const root = document.querySelector('.content');
  if (!root) return;

  // Clean up any previous subscription
  const previousCleanup = cleanupMap.get(root);
  if (previousCleanup) {
    previousCleanup();
  }

  root.innerHTML = '';
  
  // Load chat history
  loadChatHistory();

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
    updateSidebarAgentList(sidebar, agents, mainSection);
    updateSidebarApprover(sidebar, agentStore.getApprover());
    updateMainSection(mainSection, agents);
  });

  // Initial render
  const initialAgents = agentStore.getAgents();
  updateSidebarAgentList(sidebar, initialAgents, mainSection);
  updateSidebarApprover(sidebar, agentStore.getApprover());
  updateMainSection(mainSection, initialAgents);

  // Store cleanup function using WeakMap for when page changes
  cleanupMap.set(root, unsubscribe);
}

function createSidebar() {
  const sidebar = document.createElement('aside');
  sidebar.className = 'team-sidebar';

  // Toggle button at the top for collapsed state
  const topToggleBtn = document.createElement('button');
  topToggleBtn.className = 'sidebar-top-toggle';
  topToggleBtn.textContent = '☰';
  topToggleBtn.title = 'Toggle sidebar';
  topToggleBtn.setAttribute('aria-label', 'Toggle sidebar');

  // Approver section container
  const approverSection = document.createElement('div');
  approverSection.className = 'sidebar-approver-section';
  
  const approverHeaderContainer = document.createElement('div');
  approverHeaderContainer.className = 'approver-header-container';
  
  const approverHeader = document.createElement('h3');
  approverHeader.className = 'approver-header';
  approverHeader.textContent = 'Team Owner';
  
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'sidebar-toggle';
  toggleBtn.textContent = '☰';
  toggleBtn.title = 'Toggle sidebar';
  toggleBtn.setAttribute('aria-label', 'Toggle sidebar');
  
  approverHeaderContainer.appendChild(approverHeader);
  approverHeaderContainer.appendChild(toggleBtn);
  
  const approverList = document.createElement('ul');
  approverList.className = 'sidebar-approver-list';
  
  approverSection.appendChild(approverHeaderContainer);
  approverSection.appendChild(approverList);

  // Agent list section
  const agentSection = document.createElement('div');
  agentSection.className = 'sidebar-agent-section';
  
  const agentHeader = document.createElement('h3');
  agentHeader.className = 'agent-list-header';
  agentHeader.textContent = 'Team Members';
  
  const agentList = document.createElement('ul');
  agentList.className = 'sidebar-agent-list';
  
  agentSection.appendChild(agentHeader);
  agentSection.appendChild(agentList);

  sidebar.appendChild(topToggleBtn);
  sidebar.appendChild(approverSection);
  sidebar.appendChild(agentSection);

  // Toggle sidebar collapse/expand
  let isCollapsed = false;
  const toggleSidebar = () => {
    isCollapsed = !isCollapsed;
    sidebar.classList.toggle('collapsed', isCollapsed);
    toggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
    topToggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
  };
  
  toggleBtn.addEventListener('click', toggleSidebar);
  topToggleBtn.addEventListener('click', toggleSidebar);

  return sidebar;
}

function createMainSection() {
  const mainSection = document.createElement('main');
  mainSection.className = 'team-main chat-window';

  // Chat header
  const chatHeader = document.createElement('div');
  chatHeader.className = 'chat-header';

  const chatTitle = document.createElement('h2');
  chatTitle.textContent = 'Select an agent to start chatting';
  chatTitle.className = 'chat-title';
  
  chatHeader.appendChild(chatTitle);

  // Messages container
  const messagesContainer = document.createElement('div');
  messagesContainer.className = 'chat-messages';

  // Empty state
  const emptyState = document.createElement('div');
  emptyState.className = 'chat-empty-state';
  emptyState.innerHTML = '<p>💬</p><p>Select an agent from the sidebar to begin conversation</p>';
  messagesContainer.appendChild(emptyState);

  // Input area
  const inputArea = document.createElement('div');
  inputArea.className = 'chat-input-area';

  const messageInput = document.createElement('input');
  messageInput.type = 'text';
  messageInput.className = 'chat-input';
  messageInput.placeholder = 'Type your message...';
  messageInput.disabled = true;

  const sendButton = document.createElement('button');
  sendButton.className = 'chat-send-btn';
  sendButton.textContent = 'Send';
  sendButton.disabled = true;

  // Send message handler
  const sendMessage = () => {
    const text = messageInput.value.trim();
    if (!text || !selectedAgent) return;

    // Add message to history
    if (!chatHistory[selectedAgent.id]) {
      chatHistory[selectedAgent.id] = [];
    }
    
    const message = {
      text,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    chatHistory[selectedAgent.id].push(message);
    agentStore.addToConversationHistory(selectedAgent.id, message);
    saveChatHistory();
    
    // Update UI
    updateChatMessages(mainSection, selectedAgent);
    messageInput.value = '';
    
    // Disable input while waiting for response
    messageInput.disabled = true;
    sendButton.disabled = true;
    
    // Create placeholder for streaming response
    const agentMessagePlaceholder = {
      text: '',
      sender: 'agent',
      timestamp: new Date().toISOString(),
      streaming: true
    };
    chatHistory[selectedAgent.id].push(agentMessagePlaceholder);
    updateChatMessages(mainSection, selectedAgent);
    
    // Call Gemini API with streaming
    const conversationHistory = agentStore.getConversationHistory(selectedAgent.id);
    geminiService.sendMessageStream(
      selectedAgent.id,
      selectedAgent.role,
      text,
      conversationHistory,
      (chunk) => {
        // Update the placeholder message with each chunk
        agentMessagePlaceholder.text += chunk;
        updateChatMessages(mainSection, selectedAgent);
      },
      selectedAgent.temperature
    ).then((fullResponse) => {
      // Mark streaming as complete
      delete agentMessagePlaceholder.streaming;
      agentMessagePlaceholder.text = fullResponse;
      
      // Add to agent's conversation history
      agentStore.addToConversationHistory(selectedAgent.id, {
        text: fullResponse,
        sender: 'agent',
        timestamp: agentMessagePlaceholder.timestamp
      });
      
      saveChatHistory();
      updateChatMessages(mainSection, selectedAgent);
      
      // Re-enable input
      messageInput.disabled = false;
      sendButton.disabled = false;
      messageInput.focus();
    }).catch((error) => {
      console.error('Error getting response from Gemini:', error);
      
      // Remove placeholder and show error
      chatHistory[selectedAgent.id].pop();
      
      const errorMessage = {
        text: `⚠️ Error: ${error.message || 'Failed to get response. Please check your API key in .env file.'}`,
        sender: 'system',
        timestamp: new Date().toISOString()
      };
      chatHistory[selectedAgent.id].push(errorMessage);
      saveChatHistory();
      updateChatMessages(mainSection, selectedAgent);
      
      // Re-enable input
      messageInput.disabled = false;
      sendButton.disabled = false;
      messageInput.focus();
    });
  };

  sendButton.addEventListener('click', sendMessage);
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  inputArea.appendChild(messageInput);
  inputArea.appendChild(sendButton);

  mainSection.appendChild(chatHeader);
  mainSection.appendChild(messagesContainer);
  mainSection.appendChild(inputArea);

  return mainSection;
}

function updateMainSection(mainSection, agents) {
  // Only update if transitioning between empty/non-empty states
  const hasEmptyState = mainSection.querySelector('.empty-state-centered');
  const hasChatInterface = mainSection.querySelector('.chat-header');
  
  if (agents.length === 0 && !hasEmptyState) {
    // Show empty state when no team exists
    mainSection.innerHTML = '';
    mainSection.className = 'team-main';
    mainSection.style.display = 'flex';
    mainSection.style.alignItems = 'center';
    mainSection.style.justifyContent = 'center';
    
    const emptyStateContainer = document.createElement('div');
    emptyStateContainer.className = 'empty-state-centered';
    
    const emptyIcon = document.createElement('div');
    emptyIcon.className = 'empty-state-icon';
    emptyIcon.textContent = '👥';
    
    const emptyTitle = document.createElement('h2');
    emptyTitle.className = 'empty-state-title';
    emptyTitle.textContent = 'No Team Assembled Yet';
    
    const emptyText = document.createElement('p');
    emptyText.className = 'empty-state-text';
    emptyText.textContent = 'Create your AI team to start collaborating. Choose from pre-built templates or build a custom team with specific roles.';
    
    const startBtn = document.createElement('button');
    startBtn.className = 'empty-state-start-btn';
    startBtn.textContent = 'Build Your Team';
    startBtn.addEventListener('click', () => {
      const teamAssemblyLink = document.getElementById('team-assembly-link');
      if (teamAssemblyLink) teamAssemblyLink.click();
    });
    
    emptyStateContainer.appendChild(emptyIcon);
    emptyStateContainer.appendChild(emptyTitle);
    emptyStateContainer.appendChild(emptyText);
    emptyStateContainer.appendChild(startBtn);
    
    mainSection.appendChild(emptyStateContainer);
  } else if (agents.length > 0 && !hasChatInterface) {
    // Re-create chat interface only when transitioning from empty state to having agents
    mainSection.innerHTML = '';
    mainSection.className = 'team-main chat-window';
    mainSection.style.display = '';
    mainSection.style.alignItems = '';
    mainSection.style.justifyContent = '';
    
    const chatHeader = document.createElement('div');
    chatHeader.className = 'chat-header';
    const chatTitle = document.createElement('h2');
    chatTitle.textContent = 'Select an agent to start chatting';
    chatTitle.className = 'chat-title';
    chatHeader.appendChild(chatTitle);
    
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'chat-messages';
    const emptyState = document.createElement('div');
    emptyState.className = 'chat-empty-state';
    emptyState.innerHTML = '<p>💬</p><p>Select an agent from the sidebar to begin conversation</p>';
    messagesContainer.appendChild(emptyState);
    
    const inputArea = document.createElement('div');
    inputArea.className = 'chat-input-area';
    const messageInput = document.createElement('input');
    messageInput.type = 'text';
    messageInput.className = 'chat-input';
    messageInput.placeholder = 'Type your message...';
    messageInput.disabled = true;
    const sendButton = document.createElement('button');
    sendButton.className = 'chat-send-btn';
    sendButton.textContent = 'Send';
    sendButton.disabled = true;
    
    const sendMessage = () => {
      const text = messageInput.value.trim();
      if (!text || !selectedAgent) return;
      if (!chatHistory[selectedAgent.id]) {
        chatHistory[selectedAgent.id] = [];
      }
      const message = {
        text,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      chatHistory[selectedAgent.id].push(message);
      agentStore.addToConversationHistory(selectedAgent.id, message);
      saveChatHistory();
      updateChatMessages(mainSection, selectedAgent);
      messageInput.value = '';
      
      // Disable input while waiting for response
      messageInput.disabled = true;
      sendButton.disabled = true;
      
      // Create placeholder for streaming response
      const agentMessagePlaceholder = {
        text: '',
        sender: 'agent',
        timestamp: new Date().toISOString(),
        streaming: true
      };
      chatHistory[selectedAgent.id].push(agentMessagePlaceholder);
      updateChatMessages(mainSection, selectedAgent);
      
      // Call Gemini API with streaming
      const conversationHistory = agentStore.getConversationHistory(selectedAgent.id);
      geminiService.sendMessageStream(
        selectedAgent.id,
        selectedAgent.role,
        text,
        conversationHistory,
        (chunk) => {
          // Update the placeholder message with each chunk
          agentMessagePlaceholder.text += chunk;
          updateChatMessages(mainSection, selectedAgent);
        },
        selectedAgent.temperature
      ).then((fullResponse) => {
        // Mark streaming as complete
        delete agentMessagePlaceholder.streaming;
        agentMessagePlaceholder.text = fullResponse;
        
        // Add to agent's conversation history
        agentStore.addToConversationHistory(selectedAgent.id, {
          text: fullResponse,
          sender: 'agent',
          timestamp: agentMessagePlaceholder.timestamp
        });
        
        saveChatHistory();
        updateChatMessages(mainSection, selectedAgent);
        
        // Re-enable input
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
      }).catch((error) => {
        console.error('Error getting response from Gemini:', error);
        
        // Remove placeholder and show error
        chatHistory[selectedAgent.id].pop();
        
        const errorMessage = {
          text: `⚠️ Error: ${error.message || 'Failed to get response. Please check your API key in .env file.'}`,
          sender: 'system',
          timestamp: new Date().toISOString()
        };
        chatHistory[selectedAgent.id].push(errorMessage);
        saveChatHistory();
        updateChatMessages(mainSection, selectedAgent);
        
        // Re-enable input
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
      });
    };
    
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
    
    inputArea.appendChild(messageInput);
    inputArea.appendChild(sendButton);
    mainSection.appendChild(chatHeader);
    mainSection.appendChild(messagesContainer);
    mainSection.appendChild(inputArea);
  }
}

function updateSidebarAgentList(sidebar, agents, mainSection) {
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
    
    // Add selected state if this is the selected agent
    if (selectedAgent && selectedAgent.id === agent.id) {
      li.classList.add('selected');
    }
    
    // Click handler to select agent
    li.addEventListener('click', (e) => {
      // Don't trigger if clicking remove button
      if (e.target.closest('.remove-agent-btn')) return;
      
      selectedAgent = agent;
      updateChatWindow(mainSection, agent);
      
      // Update selected state in sidebar
      agentList.querySelectorAll('.sidebar-agent-item').forEach(item => {
        item.classList.remove('selected');
      });
      li.classList.add('selected');
    });
    
    li.style.cursor = 'pointer';
    
    const icon = document.createElement('span');
    icon.className = 'agent-icon';
    icon.textContent = agent.name.charAt(0);
    
    // Apply role-specific color
    const roleColor = agentStore.getRoleColor(agent.role);
    icon.style.background = `linear-gradient(135deg, ${roleColor.primary}, ${roleColor.secondary})`;
    
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
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-agent-btn';
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
    
    li.appendChild(icon);
    li.appendChild(info);
    li.appendChild(removeBtn);
    
    agentList.appendChild(li);
  });
}

function updateSidebarApprover(sidebar, approver) {
  const approverList = sidebar.querySelector('.sidebar-approver-list');
  if (!approverList) return;

  approverList.innerHTML = '';

  const li = document.createElement('li');
  li.className = 'sidebar-approver-item';
  
  const icon = document.createElement('span');
  icon.className = 'approver-icon';
  icon.textContent = '👤';
  
  const info = document.createElement('div');
  info.className = 'approver-info';
  
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'sidebar-approver-name-input';
  nameInput.value = approver.name;
  nameInput.placeholder = 'Enter name';
  nameInput.setAttribute('aria-label', 'Team owner name');
  
  info.appendChild(nameInput);
  li.appendChild(icon);
  li.appendChild(info);
  
  approverList.appendChild(li);
  
  // Handle name editing
  let originalValue = approver.name;
  
  nameInput.addEventListener('focus', () => {
    originalValue = nameInput.value;
    li.classList.add('editing');
  });
  
  nameInput.addEventListener('blur', () => {
    li.classList.remove('editing');
    const newName = nameInput.value.trim();
    if (newName && newName !== originalValue) {
      agentStore.updateApproverName(newName);
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
}

// Update chat window when an agent is selected
function updateChatWindow(mainSection, agent) {
  const chatHeader = mainSection.querySelector('.chat-header');
  const chatTitle = mainSection.querySelector('.chat-title');
  const messageInput = mainSection.querySelector('.chat-input');
  const sendButton = mainSection.querySelector('.chat-send-btn');
  
  if (chatTitle) {
    const roleColor = agentStore.getRoleColor(agent.role);
    chatTitle.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, ${roleColor.primary}, ${roleColor.secondary}); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600;">
          ${agent.name.charAt(0)}
        </div>
        <div>
          <div style="font-size: 1.5rem; font-weight: 600;">${agent.name}</div>
          <div style="font-size: 0.9rem; color: #64748b; font-weight: 400;">${agent.role}</div>
        </div>
      </div>
    `;
  }
  
  // Enable input and send button
  if (messageInput) messageInput.disabled = false;
  if (sendButton) sendButton.disabled = false;
  
  // Update messages
  updateChatMessages(mainSection, agent);
}

// Update chat messages display
function updateChatMessages(mainSection, agent) {
  const messagesContainer = mainSection.querySelector('.chat-messages');
  if (!messagesContainer) return;
  
  messagesContainer.innerHTML = '';
  
  const messages = chatHistory[agent.id] || [];
  
  if (messages.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'chat-empty-state';
    emptyState.innerHTML = '<p>💬</p><p>No messages yet. Start the conversation!</p>';
    messagesContainer.appendChild(emptyState);
    return;
  }
  
  messages.forEach(message => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${message.sender}`;
    
    const messageBubble = document.createElement('div');
    messageBubble.className = 'message-bubble';
    messageBubble.textContent = message.text;
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    const date = new Date(message.timestamp);
    messageTime.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.appendChild(messageBubble);
    messageDiv.appendChild(messageTime);
    
    messagesContainer.appendChild(messageDiv);
  });
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function updateMainApprover(mainSection, approver) {
  const container = mainSection.querySelector('.approver-container');
  if (!container) return;

  container.innerHTML = '';

  const tile = document.createElement('article');
  tile.className = 'approver-tile';
  
  const tileHeader = document.createElement('div');
  tileHeader.className = 'approver-tile-header';
  
  const avatar = document.createElement('div');
  avatar.className = 'approver-avatar';
  avatar.textContent = '👤';
  
  tileHeader.appendChild(avatar);
  
  const tileBody = document.createElement('div');
  tileBody.className = 'approver-tile-body';
  
  const nameContainer = document.createElement('div');
  nameContainer.className = 'approver-name-container';
  
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'approver-name-input';
  nameInput.value = approver.name;
  nameInput.placeholder = 'Enter your name';
  nameInput.setAttribute('aria-label', 'Approver name');
  
  const editIcon = document.createElement('span');
  editIcon.className = 'edit-icon';
  editIcon.textContent = '✏️';
  editIcon.title = 'Click name to edit';
  
  nameContainer.appendChild(nameInput);
  
  const roleLabel = document.createElement('p');
  roleLabel.className = 'approver-tile-role';
  roleLabel.textContent = 'Human Approver';
  
  tileBody.appendChild(nameContainer);
  tileBody.appendChild(roleLabel);
  
  tile.appendChild(tileHeader);
  tile.appendChild(tileBody);
  
  container.appendChild(tile);
  
  // Handle name editing
  let originalValue = approver.name;
  
  nameInput.addEventListener('focus', () => {
    originalValue = nameInput.value;
    tile.classList.add('editing');
  });
  
  nameInput.addEventListener('blur', () => {
    tile.classList.remove('editing');
    const newName = nameInput.value.trim();
    if (newName && newName !== originalValue) {
      agentStore.updateApproverName(newName);
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

function showConfirmationModal(message, onConfirm) {
  // Create confirmation modal
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

  // Show modal with animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      modal.classList.add('show');
      confirmBtn.focus();
    });
  });

  // Event handlers
  const hideModal = () => {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  };

  const handleConfirm = () => {
    hideModal();
    if (onConfirm) {
      onConfirm();
    }
  };

  cancelBtn.addEventListener('click', hideModal);
  confirmBtn.addEventListener('click', handleConfirm);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      hideModal();
    }
  });

  // Keyboard support
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      hideModal();
    } else if (e.key === 'Enter') {
      handleConfirm();
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  modal.addEventListener('remove', () => {
    document.removeEventListener('keydown', handleKeyDown);
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
