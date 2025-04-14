# SereneMind
A Website made with HTML5, CSS and javascript to help others with depression or mental health issues.


# Components:
```
serene-mind-project/
├── index.html                 # Main login page 
├── homepage.html              # Landing page
├── chat.html                  # Chat interface
├── signup.html                # User registration page
├── admin-login.html           # Admin authentication
├── admin-dashboard.html       # Admin management console
├── styles.css                 # Main stylesheet (shared across all pages)
└── script.js                  # Main JavaScript (shared functionality)
```

# Requirements:
  - Requires ollama for generating local AI Model Response.
  - Requires a model that can be used as a medical mental support agent.
  - Requires ollama server (run using - 'ollama serve' in cmd) to be running to recieve api response.

# To Change the model:
  1. Install all the files.
  2. Open the script.js.
  3. In 280th line of code change the model name with the desired one installed on your ollama locally
  4. You can find the list of models installed in ollama by using the following code in the command prompt:  ollama ls
      
