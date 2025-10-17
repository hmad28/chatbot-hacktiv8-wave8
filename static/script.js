    const form = document.getElementById("chat-form");
    const input = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");
    const sendBtn = document.getElementById("send-btn");

    let conversationHistory = [];
    let isFirstMessage = true;

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const userMessage = input.value.trim();
      if (!userMessage) return;

      // Remove empty state on first message
      if (isFirstMessage) {
        chatBox.innerHTML = '';
        isFirstMessage = false;
      }

      // Add user message
      appendMessage("user", userMessage);
      conversationHistory.push({ role: "user", text: userMessage });
      input.value = "";

      // Disable input while processing
      input.disabled = true;
      sendBtn.disabled = true;

      // Show typing indicator
      const thinkingMessageElement = appendThinkingMessage();

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversation: conversationHistory,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response from server.");
        }

        const result = await response.json();

        // Remove thinking indicator
        thinkingMessageElement.remove();

        if (result.success && result.data) {
          // Format and add AI response
          const formattedText = formatMessage(result.data);
          appendMessage("bot", formattedText);
          conversationHistory.push({ role: "model", text: result.data });
        } else {
          appendMessage("bot", result.message || "Maaf, tidak ada respons yang diterima.");
        }
      } catch (error) {
        console.error("Error:", error);
        thinkingMessageElement.remove();
        appendMessage("bot", "Gagal mendapatkan respons. Silakan coba lagi.");
      } finally {
        // Re-enable input
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
      }
    });

    function appendMessage(sender, text) {
      const msg = document.createElement("div");
      msg.classList.add("message", sender);
      
      if (typeof text === 'string') {
        msg.innerHTML = text;
      } else {
        msg.textContent = text;
      }
      
      chatBox.appendChild(msg);
      chatBox.scrollTop = chatBox.scrollHeight;
      return msg;
    }

    function appendThinkingMessage() {
      const msg = document.createElement("div");
      msg.classList.add("message", "bot", "thinking");
      msg.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
      chatBox.appendChild(msg);
      chatBox.scrollTop = chatBox.scrollHeight;
      return msg;
    }

    function formatMessage(text) {
      // Format bold text
      text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Format bullet points
      text = text.replace(/^\* (.+)$/gm, '<li>$1</li>');
      text = text.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
      
      // Format numbered lists
      text = text.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
      
      // Format line breaks
      text = text.replace(/\n\n/g, '<br><br>');
      text = text.replace(/\n/g, '<br>');
      
      return text;
    }