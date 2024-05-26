const { createApp, ref } = Vue;

createApp({
    setup() {
        const userInput = ref('');
        const messages = ref([{
            role: 'system',
            content: "You're a helpful chat bot. Answer short and concise in 150 tokens only."
        }]);
        const isLoading = ref(false);

        const messageClasses = (role) => ({
            'text-right justify-end': role === 'user',
            'text-left justify-start': role === 'assistant',
        });

        async function sendMessage() {
            if (!userInput.value.trim()) return;

            // Append user message
            messages.value.push({
                role: 'user',
                content: userInput.value
            });

            try {
                isLoading.value = true;

                const response = await axios.post('https://chatbot-be-1-bqclxlq65q-et.a.run.app/api/chat', {
                    messages: messages.value
                });

                userInput.value = '';

                // Append ChatGPT response
                messages.value.push({
                    role: 'assistant',
                    content: response.data
                });
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
        };
    },
}).mount('#app');