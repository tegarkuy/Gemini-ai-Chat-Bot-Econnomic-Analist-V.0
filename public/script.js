document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    // Maintain conversation history to send to the backend
    let conversation = [];

    // Helper to add a message to the chat box
    // Returns the created DOM element so it can be updated later (e.g., for "Thinking...")
    function appendMessage(role, content, isHtml = false) {
        const messageDiv = document.createElement('div');
        // Add classes for styling (e.g., 'message user' or 'message bot')
        messageDiv.classList.add('message', role);
        
        if (isHtml) {
            messageDiv.innerHTML = content;
        } else {
            messageDiv.textContent = content;
        }
        
        chatBox.appendChild(messageDiv);
        
        // Auto-scroll to the bottom of the chat box
        chatBox.scrollTop = chatBox.scrollHeight;
        
        return messageDiv;
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const messageText = userInput.value.trim();
        if (!messageText) return;

        // Clear input field immediately
        userInput.value = '';

        // 1. Add user's message to UI
        appendMessage('user', messageText);
        
        // 2. Add user's message to conversation history
        conversation.push({ role: 'user', text: messageText });

        // 3. Show temporary typing indicator
        const botMessageDiv = appendMessage('bot', '<div class="typing-indicator"><span></span><span></span><span></span></div>', true);

        try {
            // 4. Send POST request to backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ conversation })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // 5. Check if we received a valid result
            if (data && data.result) {
                // Replace "Thinking..." message with the actual AI response, parsing Markdown
                botMessageDiv.innerHTML = marked.parse(data.result);
                
                // Add the model's response to the conversation history
                conversation.push({ role: 'model', text: data.result });
            } else {
                throw new Error('Invalid response format from server');
            }

        } catch (error) {
            console.error('Chat error:', error);
            
            // 6. Handle errors by updating the "Thinking..." message
            botMessageDiv.textContent = 'Failed to get response from server.';
            botMessageDiv.classList.add('error-message'); // Optional class for error styling
            
            // Note: We deliberately do not push the error message to the `conversation` array
            // so the backend doesn't receive local error text in subsequent context.
        }
    });
});