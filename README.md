"# Webhook Testing Bot" 

Setup Steps
1. Install dependencies

```
npm install
```

2. Run the app:
```
node src/app.js
```

3. Expose the app using a tool like ngrok:

```
ngrok http 300
```

if needed, npm install -g ngrok

4. Use the ngrok URL as the GitHub webhook payload URL

Localtunnel version (since ngrok costs)
Setting Up LocalTunnel
Install LocalTunnel: Install it globally using npm:

npm install -g localtunnel
Start LocalTunnel: Run it on the port your server is running on (e.g., 3000):

lt --port 3000
Copy the Public URL: You’ll get a public URL like this:

https://<random-string>.loca.lt
Set the Payload URL in GitHub: Use the URL with your webhook endpoint, e.g.:

https://<random-string>.loca.lt/github-webhook
Test the Webhook: