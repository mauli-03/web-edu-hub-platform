function sendMessage() {
    let userInput = document.getElementById("userInput").value;
    if (userInput.trim() === "") return;

    let chatBox = document.getElementById("chatBox");

    // Add user message
    let userMessage = document.createElement("div");
    userMessage.className = "message user-message";
    userMessage.textContent = userInput;
    chatBox.appendChild(userMessage);

    document.getElementById("userInput").value = "";

    // Fake bot response (replace with API call later)
    setTimeout(() => {
        let botMessage = document.createElement("div");
        botMessage.className = "message bot-message";
        botMessage.textContent = "I'm a bot! How can I help?"; // Replace this with dynamic response
        chatBox.appendChild(botMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 500);
}