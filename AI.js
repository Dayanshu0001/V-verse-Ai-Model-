


const btn = document.querySelector("#btn");
const content = document.querySelector("#content");
const voice = document.querySelector("#voice");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = "en-US";
recognition.interimResults = false;

let isProcessing = false; // Flag to track processing state

btn.addEventListener("click", () => {
    if (isProcessing) {
        terminateProcess(); // Terminate if already processing
        return;
    }
    content.innerText = "Listening...";
    isProcessing = true; // Set flag to indicate process has started
    recognition.start();
});

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    content.innerText = `You said: "${transcript}"`;
    takeCommand(transcript.toLowerCase());
};

recognition.onerror = (event) => {
    content.innerText = `Error: ${event.error}`;
    isProcessing = false; // Reset processing flag on error
};

function terminateProcess() {
    recognition.stop(); // Stop speech recognition if active
    content.innerText = "Process terminated.";
    isProcessing = false; // Reset processing flag
}

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('karen') ||
        voice.name.toLowerCase().includes('zira')
    );

    if (femaleVoice) {
        utterance.voice = femaleVoice;
    }

    window.speechSynthesis.cancel(); // Stop any ongoing speech synthesis
    window.speechSynthesis.speak(utterance);

    utterance.onend = () => {
        isProcessing = false; // Reset processing flag when speech ends
    };
}

// Load voices early if possible
window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
};

async function fetchAIResponse(prompt) {
    const TOGETHER_API_KEY = "23777c79860ab359948297f752fa03d73375ae489c8a203e2f85c6e8e2542a5f";

    try {
        const response = await fetch("https://api.together.xyz/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOGETHER_API_KEY}`,
            },
            body: JSON.stringify({
                model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 150,
                temperature: 0.7,
            }),
        });

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error fetching AI response:", error);
        return "Sorry, I couldn't process your request.";
    } finally {
        isProcessing = false; // Reset processing flag when API call completes
    }
}

async function takeCommand(userInput) {
    let responseText;

    if (userInput.includes("hello") || userInput.includes("hi")) {
        responseText = "Hello! How can I assist you today?";
    } else if (userInput.includes("time")) {
        const time = new Date().toLocaleTimeString();
        responseText = `The time is ${time}`;
    } else if (userInput.includes("name")) {
        responseText = `Hello! My name is Shifra. How can I help you?`;
    } else {
        responseText = await fetchAIResponse(userInput);
    }

    speak(responseText);
    content.innerText = `Response: ${responseText}`;
}
