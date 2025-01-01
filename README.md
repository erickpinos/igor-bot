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
