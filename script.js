// Utility functions
// Add this near the top of script.js
const SUICIDE_KEYWORDS = [
    'suicide', 'kill myself', 'end my life', 'want to die',
    'take my life', 'end it all', 'no reason to live'
  ];
  
  function checkForConcerningMessage(message) {
    const lowerMessage = message.toLowerCase();
    return SUICIDE_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
  }

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      element.style.display = "block";
    }
  }
  
  function hideError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = "none";
    }
  }
  
  // Authentication state checks
  function isAdminLoggedIn() {
    return localStorage.getItem("sereneMindAdminToken") !== null;
  }
  
  function isUserLoggedIn() {
    return localStorage.getItem("sereneMindCurrentUser") !== null;
  }
  
  function checkAuth() {
    const currentPage = window.location.pathname.split("/").pop();
  
    // Admin dashboard protection
    if (currentPage === "admin-dashboard.html" && !isAdminLoggedIn()) {
      window.location.href = "admin-login.html";
      return;
    }
  
    // Chat page protection
    if (currentPage === "chat.html" && !isUserLoggedIn()) {
      window.location.href = "index.html";
      return;
    }
  
    // Redirect logged-in users away from login/signup pages
    if (
      (currentPage === "index.html" || currentPage === "signup.html") &&
      isUserLoggedIn()
    ) {
      window.location.href = "chat.html";
      return;
    }
  
    // Redirect logged-in admins away from admin login
    if (currentPage === "admin-login.html" && isAdminLoggedIn()) {
      window.location.href = "admin-dashboard.html";
    }
  }
  
  // Navigation highlighting
  function highlightActiveNavLink() {
    if (document.querySelector(".main-nav")) {
      const navLinks = document.querySelectorAll(".nav-link");
      const currentPage =
        window.location.pathname.split("/").pop() || "homepage.html";
  
      navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === currentPage) {
          link.classList.add("active");
        }
      });
    }
  }
  
  // Initialize page-specific functionality
  function initPage() {
    checkAuth();
    highlightActiveNavLink();
  
    const currentPage = window.location.pathname.split("/").pop();
  
    switch (currentPage) {
      case "index.html":
        initLoginPage();
        break;
      case "signup.html":
        initSignupPage();
        break;
      case "chat.html":
        initChatPage();
        break;
      case "admin-login.html":
        initAdminLoginPage();
        break;
      case "admin-dashboard.html":
        initAdminDashboard();
        break;
      default:
        // No specific initialization needed for other pages
        break;
    }
  }
  
  // Regular User Login
  function initLoginPage() {
    const loginButton = document.getElementById("login-button");
    if (loginButton) {
      loginButton.addEventListener("click", handleLogin);
    }
  
    // Auto-redirect admin usernames
    document.getElementById("username")?.addEventListener("blur", function (e) {
      const username = e.target.value.trim();
      if (username.startsWith("admin_")) {
        window.location.href = "admin-login.html";
      }
    });
  }
  
  function handleLogin() {
    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
  
    hideError("login-error");
  
    if (!username || !password) {
      showError("login-error", "Please enter both username and password");
      return;
    }
  
    const users = JSON.parse(localStorage.getItem("sereneMindUsers")) || {};
    if (users[username] && users[username].password === password) {
      localStorage.setItem("sereneMindCurrentUser", username);
  
      // Update last login time
      users[username].lastActive = new Date().toISOString();
      localStorage.setItem("sereneMindUsers", JSON.stringify(users));
  
      window.location.href = "chat.html";
    } else {
      showError("login-error", "Invalid username or password");
    }
  }
  
  // User Signup
  function initSignupPage() {
    const signupButton = document.getElementById("signup-button");
    if (signupButton) {
      signupButton.addEventListener("click", handleSignup);
    }
  }
  
  function handleSignup() {
    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
    const confirmPassword = document
      .getElementById("confirm-password")
      ?.value.trim();
  
    hideError("signup-error");
  
    if (!username || !password || !confirmPassword) {
      showError("signup-error", "Please fill in all fields");
      return;
    }
  
    if (password !== confirmPassword) {
      showError("signup-error", "Passwords do not match");
      return;
    }
  
    const users = JSON.parse(localStorage.getItem("sereneMindUsers")) || {};
  
    if (users[username]) {
      showError("signup-error", "Username already exists");
      return;
    }
  
    users[username] = {
      password: password,
      createdAt: new Date().toISOString(),
      chatCount: 0,
    };
  
    localStorage.setItem("sereneMindUsers", JSON.stringify(users));
    localStorage.setItem("sereneMindCurrentUser", username);
    window.location.href = "chat.html";
  }
  
  // Chat Functionality
  function initChatPage() {
    // Logout functionality
    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
      logoutButton.addEventListener("click", function () {
        localStorage.removeItem("sereneMindCurrentUser");
        window.location.href = "homepage.html";
      });
    }
  
    // Restart chat functionality
    const restartChatButton = document.getElementById("restart-chat-button");
    const restartModal = document.getElementById("restart-modal");
    const confirmRestart = document.getElementById("confirm-restart");
    const cancelRestart = document.getElementById("cancel-restart");
  
    if (restartChatButton && restartModal && confirmRestart && cancelRestart) {
      restartChatButton.addEventListener("click", function () {
        restartModal.style.display = "flex";
      });
  
      confirmRestart.addEventListener("click", function () {
        restartChat();
        restartModal.style.display = "none";
      });
  
      cancelRestart.addEventListener("click", function () {
        restartModal.style.display = "none";
      });
  
      restartModal.addEventListener("click", function (e) {
        if (e.target === restartModal) {
          restartModal.style.display = "none";
        }
      });
    }
  
    // Delete account functionality
    const deleteAccountButton = document.getElementById("delete-account-button");
    const deleteModal = document.getElementById("delete-account-modal");
    const confirmDelete = document.getElementById("confirm-delete");
    const cancelDelete = document.getElementById("cancel-delete");
  
    if (deleteAccountButton && deleteModal && confirmDelete && cancelDelete) {
      deleteAccountButton.addEventListener("click", function() {
        deleteModal.style.display = "flex";
      });
  
      confirmDelete.addEventListener("click", function() {
        deleteUserAccount();
        deleteModal.style.display = "none";
      });
  
      cancelDelete.addEventListener("click", function() {
        deleteModal.style.display = "none";
      });
  
      deleteModal.addEventListener("click", function(e) {
        if (e.target === deleteModal) {
          deleteModal.style.display = "none";
        }
      });
    }
  
    // Chat elements
    const chatContainer = document.getElementById("chat-container");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const typingIndicator = document.getElementById("typing");
  
    if (!chatContainer || !userInput || !sendButton || !typingIndicator) {
      return;
    }
  
    // Ollama Configuration
    const OLLAMA_API_URL = "http://localhost:11434/api/generate";
    const MODEL_NAME = "llama2"; // Default model
  
    function getStorageKey() {
      return `sereneMindChatData_${localStorage.getItem(
        "sereneMindCurrentUser"
      )}`;
    }
  
    function restartChat() {
      chatContainer.innerHTML = `
              <div class="message bot-message">
                  Hello, I'm here to listen. How are you feeling today?
              </div>
              <div class="typing-indicator" id="typing" style="display: none;">Therapist is typing...</div>
          `;
      localStorage.removeItem(getStorageKey());
      saveChat();
    }
  
    function loadChatHistory() {
      const savedData = localStorage.getItem(getStorageKey());
      if (savedData) {
        chatContainer.innerHTML = JSON.parse(savedData);
      }
    }
  
    function saveChat() {
      localStorage.setItem(
        getStorageKey(),
        JSON.stringify(chatContainer.innerHTML)
      );
  
      // Update user's chat count
      const username = localStorage.getItem("sereneMindCurrentUser");
      if (username) {
        const users = JSON.parse(localStorage.getItem("sereneMindUsers")) || {};
        if (users[username]) {
          users[username].chatCount = (users[username].chatCount || 0) + 1;
          users[username].lastActive = new Date().toISOString();
          localStorage.setItem("sereneMindUsers", JSON.stringify(users));
        }
      }
    }
  
    function addMessage(text, isUser) {
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message");
      messageDiv.classList.add(isUser ? "user-message" : "bot-message");
      messageDiv.textContent = text;
      chatContainer.appendChild(messageDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;
      saveChat();
    }
  
    async function getTherapistResponse(userMessage) {
      try {
        const prompt = `You are a compassionate mental health therapist. Your role is to:
  - Listen actively and empathetically
  - Ask open-ended questions to encourage reflection
  - Provide supportive responses
  - Avoid giving direct medical advice
  - Encourage professional help when needed
  
  Current conversation:
  User: ${userMessage}
  Therapist:`;
  
        console.log("Sending to Ollama:", { model: MODEL_NAME, prompt: prompt });
  
        const response = await fetch(OLLAMA_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: MODEL_NAME,
            prompt: prompt,
            stream: false,
            options: {
              temperature: 0.7,
              top_p: 0.9,
              max_tokens: 500,
            },
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Ollama API Error:", errorData);
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }
  
        const data = await response.json();
        console.log("Received from Ollama:", data);
  
        if (!data.response) {
          throw new Error("No response received from Ollama");
        }
  
        return data.response.trim();
      } catch (error) {
        console.error("Error in getTherapistResponse:", error);
        return `I'm having trouble responding right now. Please make sure:
  1. Ollama is running (check terminal)
  2. Model "${MODEL_NAME}" is installed
  Error: ${error.message}`;
      }
    }
  
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
      
        addMessage(message, true);
        userInput.value = "";
      
        // Check for concerning content
        if (checkForConcerningMessage(message)) {
          alertAdminDashboard(message);
        }
      
        typingIndicator.style.display = "block";
        chatContainer.scrollTop = chatContainer.scrollHeight;
      
        try {
          const therapistResponse = await getTherapistResponse(message);
          typingIndicator.style.display = "none";
          addMessage(therapistResponse, false);
        } catch (error) {
          typingIndicator.style.display = "none";
          addMessage(
            "Sorry, I'm having trouble connecting to the therapist. Please check the console for errors.",
            false
          );
          console.error("Error in sendMessage:", error);
        }
      }
  
    function deleteUserAccount() {
      const username = localStorage.getItem("sereneMindCurrentUser");
      if (!username) return;
  
      // Remove user data
      const users = JSON.parse(localStorage.getItem("sereneMindUsers")) || {};
      delete users[username];
      localStorage.setItem("sereneMindUsers", JSON.stringify(users));
  
      // Remove chat history
      const chatKey = `sereneMindChatData_${username}`;
      localStorage.removeItem(chatKey);
  
      // Remove current session
      localStorage.removeItem("sereneMindCurrentUser");
  
      // Redirect to homepage
      window.location.href = "homepage.html";
    }
  
    // Load any existing chat history
    loadChatHistory();
  
    // Event listeners
    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        sendMessage();
      }
    });
  }
  
  // Admin Login
  function initAdminLoginPage() {
    const adminLoginButton = document.getElementById("admin-login-button");
    if (adminLoginButton) {
      adminLoginButton.addEventListener("click", handleAdminLogin);
    }
  }
  
  function handleAdminLogin() {
    const username = document.getElementById("admin-username")?.value.trim();
    const password = document.getElementById("admin-password")?.value.trim();
  
    hideError("admin-login-error");
  
    // In a real app, this would be a server-side check
    const ADMIN_CREDENTIALS = {
      username: "admin",
      password: "admin@123", // CHANGE THIS IN PRODUCTION!
    };
  
    if (!username || !password) {
      showError("admin-login-error", "Please enter both admin ID and password");
      return;
    }
  
    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      // Set admin token (in real app, use proper authentication)
      localStorage.setItem("sereneMindAdminToken", "admin_authenticated");
      window.location.href = "admin-dashboard.html";
    } else {
      showError("admin-login-error", "Invalid admin credentials");
    }
  }
  
  // Admin Dashboard
  function initAdminDashboard() {
    // Logout functionality
    const logoutButton = document.getElementById("admin-logout-button");
    if (logoutButton) {
      logoutButton.addEventListener("click", function () {
        localStorage.removeItem("sereneMindAdminToken");
        window.location.href = "homepage.html";
      });
    }
  
    // Load admin data
    loadAdminData();
  
    // Button event listeners
    document
      .getElementById("refresh-data")
      ?.addEventListener("click", loadAdminData);
    document.getElementById("export-data")?.addEventListener("click", exportData);
    document
      .getElementById("system-restart")
      ?.addEventListener("click", restartSystem);
    setupAlertsDisplay();
  }

  function setupAlertsDisplay() {
    const alertsContainer = document.createElement('div');
    alertsContainer.id = 'alerts-container';
    alertsContainer.style.position = 'fixed';
    alertsContainer.style.top = '80px';
    alertsContainer.style.right = '20px';
    alertsContainer.style.zIndex = '1000';
    alertsContainer.style.backgroundColor = '#fff';
    alertsContainer.style.padding = '15px';
    alertsContainer.style.borderRadius = '8px';
    alertsContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    alertsContainer.style.maxWidth = '400px';
    alertsContainer.style.display = 'none';
    
    // Create header with title and clear button
    const alertsHeader = document.createElement('div');
    alertsHeader.style.display = 'flex';
    alertsHeader.style.justifyContent = 'space-between';
    alertsHeader.style.alignItems = 'center';
    alertsHeader.style.marginBottom = '15px';
    
    const alertsTitle = document.createElement('h3');
    alertsTitle.textContent = 'Crisis Alerts';
    alertsTitle.style.margin = '0';
    alertsTitle.style.color = '#e74c3c';
    
    const clearAllButton = document.createElement('button');
    clearAllButton.textContent = 'Clear All';
    clearAllButton.className = 'admin-button small danger';
    clearAllButton.style.padding = '5px 10px';
    clearAllButton.style.fontSize = '0.8rem';
    clearAllButton.addEventListener('click', clearAllAlerts);
    
    alertsHeader.appendChild(alertsTitle);
    alertsHeader.appendChild(clearAllButton);
    
    // Create alerts list container
    const alertsList = document.createElement('div');
    alertsList.id = 'alerts-list';
    alertsList.style.maxHeight = '400px';
    alertsList.style.overflowY = 'auto';
    
    alertsContainer.appendChild(alertsHeader);
    alertsContainer.appendChild(alertsList);
    document.body.appendChild(alertsContainer);
  
    // Create alert bell icon
    const alertBell = document.createElement('div');
    alertBell.innerHTML = '🔔';
    alertBell.style.position = 'fixed';
    alertBell.style.top = '20px';
    alertBell.style.right = '20px';
    alertBell.style.fontSize = '24px';
    alertBell.style.cursor = 'pointer';
    alertBell.style.zIndex = '1000';
    
    // Create alert badge counter
    const alertBadge = document.createElement('span');
    alertBadge.style.position = 'absolute';
    alertBadge.style.top = '-10px';
    alertBadge.style.right = '-10px';
    alertBadge.style.backgroundColor = '#e74c3c';
    alertBadge.style.color = 'white';
    alertBadge.style.borderRadius = '50%';
    alertBadge.style.padding = '2px 6px';
    alertBadge.style.fontSize = '12px';
    alertBadge.style.display = 'none';
    alertBell.appendChild(alertBadge);
  
    // Toggle alerts container visibility
    alertBell.addEventListener('click', function() {
      alertsContainer.style.display = alertsContainer.style.display === 'none' ? 'block' : 'none';
      if (alertsContainer.style.display === 'block') {
        alertBadge.style.display = 'none';
        // Mark alerts as viewed
        const alerts = JSON.parse(localStorage.getItem("sereneMindAlerts")) || [];
        alerts.forEach(alert => alert.viewed = true);
        localStorage.setItem("sereneMindAlerts", JSON.stringify(alerts));
      }
    });
  
    document.body.appendChild(alertBell);
  
    // Check for alerts periodically
    setInterval(updateAlertsDisplay, 5000);
    updateAlertsDisplay();
  }
  
  function clearAllAlerts() {
    if (confirm('Are you sure you want to clear all crisis alerts? This cannot be undone.')) {
      localStorage.removeItem("sereneMindAlerts");
      updateAlertsDisplay();
      
      // Hide the alerts container if it's open
      const alertsContainer = document.getElementById('alerts-container');
      if (alertsContainer) {
        alertsContainer.style.display = 'none';
      }
      
      // Hide the badge
      const alertBadge = document.querySelector('#alerts-container + div span');
      if (alertBadge) {
        alertBadge.style.display = 'none';
      }
    }
  }

  function updateAlertsDisplay() {
    const alerts = JSON.parse(localStorage.getItem("sereneMindAlerts")) || [];
    const unviewedAlerts = alerts.filter(alert => !alert.viewed);
    const alertBadge = document.querySelector('#alerts-container + div span');
    const alertsList = document.getElementById('alerts-list');
  
    if (alertBadge) {
      if (unviewedAlerts.length > 0) {
        alertBadge.textContent = unviewedAlerts.length;
        alertBadge.style.display = 'block';
      } else {
        alertBadge.style.display = 'none';
      }
    }
  
    if (alertsList) {
      alertsList.innerHTML = '';
      if (alerts.length === 0) {
        alertsList.innerHTML = '<p>No active alerts</p>';
      } else {
        alerts.reverse().forEach(alert => {
          const alertDiv = document.createElement('div');
          alertDiv.style.marginBottom = '15px';
          alertDiv.style.paddingBottom = '15px';
          alertDiv.style.borderBottom = '1px solid #eee';
          
          const userInfo = document.createElement('p');
          userInfo.innerHTML = `<strong>User:</strong> ${alert.username}`;
          
          const message = document.createElement('p');
          message.innerHTML = `<strong>Message:</strong> "${alert.message}"`;
          
          const time = document.createElement('p');
          time.innerHTML = `<strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}`;
          
          alertDiv.appendChild(userInfo);
          alertDiv.appendChild(message);
          alertDiv.appendChild(time);
  
          if (alert.location) {
            const location = document.createElement('p');
            location.innerHTML = `<strong>Approximate Location:</strong> 
              <a href="https://www.google.com/maps?q=${alert.location.latitude},${alert.location.longitude}" target="_blank">
                View on Map (accuracy: ~${Math.round(alert.location.accuracy)}m)
              </a>`;
            alertDiv.appendChild(location);
          } else {
            const noLocation = document.createElement('p');
            noLocation.innerHTML = '<strong>Location:</strong> Not available';
            alertDiv.appendChild(noLocation);
          }
  
          alertsList.appendChild(alertDiv);
        });
      }
    }
  }
  
  function loadAdminData() {
    const users = JSON.parse(localStorage.getItem("sereneMindUsers")) || {};
  const userCount = Object.keys(users).length;

  // Update stats
  document.getElementById("total-users").textContent = userCount;
  document.getElementById("active-chats").textContent = Object.values(
    users
  ).reduce((sum, user) => sum + (user.chatCount || 0), 0);
  document.getElementById("system-status").textContent = "Operational";

  // Populate user table
  const userTable = document
    .getElementById("user-list")
    ?.querySelector("tbody");
  if (userTable) {
    userTable.innerHTML = "";
    Object.entries(users).forEach(([username, userData]) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${username}</td>
                <td>${new Date(
                  userData.lastActive || userData.createdAt
                ).toLocaleString()}</td>
                <td>${userData.chatCount || 0}</td>
                <td>
                    <button class="admin-button small danger delete-user" data-user="${username}">Delete</button>
                </td>
            `;
      userTable.appendChild(row);
    });
  
      // Add event listeners for delete buttons
      document.querySelectorAll(".delete-user").forEach(button => {
        button.addEventListener("click", function() {
          const username = this.getAttribute("data-user");
          if (confirm(`Are you sure you want to delete ${username}? This cannot be undone.`)) {
            deleteUserAccountAdmin(username);
          }
        });
      });
    }
  }

  function showUserChatHistory(username) {
    // Create modal if it doesn't exist
    let modal = document.getElementById("chat-history-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "chat-history-modal";
      modal.className = "modal";
      modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px; max-height: 80vh;">
          <h3>Chat History: <span id="chat-history-username"></span></h3>
          <div id="chat-history-content" style="overflow-y: auto; max-height: 60vh; padding: 10px; background: white; border-radius: 5px;"></div>
          <div class="modal-buttons" style="margin-top: 15px;">
            <button id="close-chat-history" class="modal-button cancel">Close</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
  
      // Add close button event listener
      document.getElementById("close-chat-history").addEventListener("click", () => {
        modal.style.display = "none";
      });
    }
  
    // Set username and content
    document.getElementById("chat-history-username").textContent = username;
    const contentDiv = document.getElementById("chat-history-content");
  
    // Load chat history
    const chatKey = `sereneMindChatData_${username}`;
    const chatHTML = localStorage.getItem(chatKey);
  
    if (chatHTML) {
      // Create a temporary div to parse the HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = chatHTML;
      
      // Clear previous content
      contentDiv.innerHTML = "";
      
      // Clone and append each message
      const messages = tempDiv.querySelectorAll(".message");
      messages.forEach(message => {
        const clonedMessage = message.cloneNode(true);
        
        // Style messages for better readability in admin view
        if (clonedMessage.classList.contains("user-message")) {
          clonedMessage.style.backgroundColor = "#e3f2fd";
          clonedMessage.style.marginLeft = "auto";
          clonedMessage.style.marginRight = "10px";
        } else {
          clonedMessage.style.backgroundColor = "#edf2f7";
          clonedMessage.style.marginRight = "auto";
          clonedMessage.style.marginLeft = "10px";
        }
        
        clonedMessage.style.width = "80%";
        clonedMessage.style.padding = "10px 15px";
        clonedMessage.style.marginBottom = "10px";
        clonedMessage.style.borderRadius = "15px";
        
        contentDiv.appendChild(clonedMessage);
      });
      
      // Scroll to bottom
      contentDiv.scrollTop = contentDiv.scrollHeight;
    } else {
      contentDiv.innerHTML = "<p>No chat history found for this user.</p>";
    }
  
    // Show modal
    modal.style.display = "flex";
  }
  
  function deleteUserAccountAdmin(username) {
    if (!username) return;
  
    // Remove user data
    const users = JSON.parse(localStorage.getItem("sereneMindUsers")) || {};
    delete users[username];
    localStorage.setItem("sereneMindUsers", JSON.stringify(users));
  
    // Remove chat history
    const chatKey = `sereneMindChatData_${username}`;
    localStorage.removeItem(chatKey);
  
    // If the deleted user is currently logged in, log them out
    const currentUser = localStorage.getItem("sereneMindCurrentUser");
    if (currentUser === username) {
      localStorage.removeItem("sereneMindCurrentUser");
    }
  
    // Reload the admin data
    loadAdminData();
  }
  
  function exportData() {
    // Show loading indicator
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "pdf-loading";
    loadingDiv.textContent = "Generating PDF report...";
    document.body.appendChild(loadingDiv);
  
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
  
        // Add title and logo placeholder
        doc.setFontSize(20);
        doc.setTextColor(40, 53, 147);
        doc.text("SereneMind Therapy Chat Report", 105, 20, { align: "center" });
  
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 28, {
          align: "center",
        });
  
        // Add line separator
        doc.setDrawColor(200);
        doc.line(15, 35, 195, 35);
  
        // Get all user data
        const users = JSON.parse(localStorage.getItem("sereneMindUsers")) || {};
        const userData = Object.entries(users).map(([username, data]) => ({
          username,
          chatCount: data.chatCount || 0,
          lastActive: data.lastActive
            ? new Date(data.lastActive).toLocaleString()
            : "Never",
          created: data.createdAt
            ? new Date(data.createdAt).toLocaleDateString()
            : "Unknown",
        }));
  
        // Add summary section
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text("User Summary", 15, 45);
  
        // Create user table
        doc.autoTable({
          head: [["Username", "Chats", "Last Active", "Created"]],
          body: userData.map((user) => [
            user.username,
            user.chatCount,
            user.lastActive,
            user.created,
          ]),
          startY: 55,
          headStyles: {
            fillColor: [93, 156, 236], // Primary color
            textColor: 255,
            fontStyle: "bold",
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240],
          },
          margin: { top: 55 },
        });
  
        // Add detailed chat logs
        let yPos = doc.lastAutoTable.finalY + 15;
  
        Object.entries(users).forEach(([username]) => {
          const chatKey = `sereneMindChatData_${username}`;
          const chatHTML = localStorage.getItem(chatKey);
  
          if (chatHTML && yPos < 250) {
            // Add user section header
            doc.setFontSize(14);
            doc.setTextColor(40, 53, 147);
            doc.text(`Chat History: ${username}`, 15, yPos + 10);
            yPos += 15;
  
            // Convert HTML to plain text
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = chatHTML;
            const chatText = tempDiv.textContent || tempDiv.innerText || "";
  
            // Format chat messages
            const formattedChat = chatText
              .split("\n")
              .filter((line) => line.trim().length > 0)
              .map((line) => `• ${line.trim()}`)
              .join("\n");
  
            // Add chat content
            doc.setFontSize(10);
            doc.setTextColor(0);
            const splitText = doc.splitTextToSize(formattedChat, 180);
  
            // Add new page if needed
            if (yPos + splitText.length * 5 > 280) {
              doc.addPage();
              yPos = 20;
              doc.setFontSize(14);
              doc.setTextColor(40, 53, 147);
              doc.text(`Chat History: ${username} (cont.)`, 15, yPos);
              yPos += 10;
            }
  
            doc.text(splitText, 20, yPos + 5);
            yPos += splitText.length * 5 + 15;
  
            // Add separator
            doc.setDrawColor(200);
            doc.line(15, yPos, 195, yPos);
            yPos += 10;
          }
        });
  
        // Add footer
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Confidential - SereneMind Therapy System", 105, 285, {
          align: "center",
        });
  
        // Save the PDF
        doc.save(
          `SereneMind_Export_${new Date().toISOString().slice(0, 10)}.pdf`
        );
      } catch (error) {
        console.error("PDF generation failed:", error);
        alert("Failed to generate PDF: " + error.message);
      } finally {
        // Remove loading indicator
        document.body.removeChild(loadingDiv);
      }
    }, 100);
  }
  
  function restartSystem() {
    if (
      confirm(
        "Are you sure you want to restart the system? This will clear all current sessions."
      )
    ) {
      localStorage.removeItem("sereneMindCurrentUser");
      localStorage.removeItem("sereneMindAdminToken");
      alert("System sessions cleared. Page will reload.");
      window.location.reload();
    }
  }
  // Add this to script.js
function alertAdminDashboard(concerningMessage) {
    const username = localStorage.getItem("sereneMindCurrentUser");
    if (!username) return;
  
    // Get user's approximate location (note: this is not precise)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const alert = {
          username: username,
          message: concerningMessage,
          timestamp: new Date().toISOString(),
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          },
          viewed: false
        };
  
        // Save alert to localStorage
        const alerts = JSON.parse(localStorage.getItem("sereneMindAlerts")) || [];
        alerts.push(alert);
        localStorage.setItem("sereneMindAlerts", JSON.stringify(alerts));
        
        // In a real app, you would send this to your server
        console.log("Potential crisis detected:", alert);
      },
      (error) => {
        // Location access denied or failed
        const alert = {
          username: username,
          message: concerningMessage,
          timestamp: new Date().toISOString(),
          location: null,
          viewed: false
        };
  
        const alerts = JSON.parse(localStorage.getItem("sereneMindAlerts")) || [];
        alerts.push(alert);
        localStorage.setItem("sereneMindAlerts", JSON.stringify(alerts));
        
        console.log("Potential crisis detected (no location):", alert);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }
  function clearAllAlerts() {
    if (confirm('Are you sure you want to clear all crisis alerts? This cannot be undone.')) {
      localStorage.removeItem("sereneMindAlerts");
      updateAlertsDisplay();
      
      // Hide the alerts container if it's open
      const alertsContainer = document.getElementById('alerts-container');
      if (alertsContainer) {
        alertsContainer.style.display = 'none';
      }
      
      // Hide the badge
      const alertBadge = document.querySelector('#alerts-container + div span');
      if (alertBadge) {
        alertBadge.style.display = 'none';
      }
    }
  }

  // Initialize the page
  document.addEventListener("DOMContentLoaded", initPage);