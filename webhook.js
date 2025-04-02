const fetch = require('node-fetch');

const webhookUrl = 'YOUR_WEBHOOK_URL';
const message = {
  text: 'Hello from my application!',
};

fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=UTF-8' },
  body: JSON.stringify(message),
})
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => console.log('Message posted successfully:', data))
  .catch((error) => console.error('Error posting message:', error));
