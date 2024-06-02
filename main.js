const { createApp, ref } = Vue;
const md = markdownit({ html: true, linkify: true, typographer: true });
const API_DOMAIN = 'https://chatbot-be-1-bqclxlq65q-et.a.run.app';
// const API_DOMAIN = 'http://127.0.0.1:8080';

createApp({
    setup() {
        const userInput = ref('');
        const messages = ref([{
            role: 'system',
            content: "You're a helpful chat bot. Answer short and concise in 150 tokens only."
        }]);
        const isLoading = ref(false);
        const streamingMessage = ref(null);

        const messageClasses = (role) => ({
            'text-right justify-end': role === 'user',
            'text-left justify-start': role === 'assistant',
        });

        const renderMarkdown = (content) => {
            return md.render(content);
        };

        async function sendMessage() {
            if (!userInput.value.trim()) return;

            messages.value.push({
                role: 'user',
                content: userInput.value
            });

            try {
                isLoading.value = true;

                const response = await fetch(`${API_DOMAIN}/api/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messages: messages.value
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const reader = response.body.getReader();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    const decodedValue = new TextDecoder("utf-8").decode(value);
                    console.log('Data from reader:', decodedValue); // Add this line
                    if (streamingMessage.value === null) {
                        streamingMessage.value = {
                            role: 'assistant',
                            content: decodedValue
                        };
                    } else {
                        streamingMessage.value.content += decodedValue;
                    }
                }

                if (streamingMessage.value !== null) {
                    console.log(streamingMessage.value.content)
                    messages.value.push({
                        role: 'assistant',
                        content: renderMarkdown(streamingMessage.value.content)
                    });
                    streamingMessage.value = null;
                }

                userInput.value = '';
            } catch (error) {
                console.error('There was an error with the API request', error);
            } finally {
                isLoading.value = false;
            }
        }

        return {
            userInput,
            messages,
            messageClasses,
            sendMessage,
            isLoading,
            streamingMessage,
            renderMarkdown
        };
    },
}).mount('#app');
