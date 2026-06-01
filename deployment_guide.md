# How to Deploy Your Application

Your application is a full-stack Node.js application (Vue.js frontend + Express.js backend). Because you are using a local JSON file (`server/db.json`) as a database, you need to deploy to a platform that supports a Node server and a persistent disk if you want to preserve your data between deployments.

I have updated your `server/index.js` and `package.json` to make deployment seamless! Your Node server is now configured to serve your frontend app in production.

## Deployment Options

For a full-stack Node app with a JSON database, **Render** or **Railway** are fantastic choices. 

Here is how you can deploy your application on [Render](https://render.com/) for free:

### Step 1: Push your code to GitHub
1. Create a free account on GitHub.
2. Initialize a git repository in your project folder, commit your code, and push it to a new GitHub repository.
```bash
git init
git add .
git commit -m "Initial commit"
# Link and push to your GitHub repo
```

### Step 2: Create a Web Service on Render
1. Go to [Render](https://render.com/) and sign in with GitHub.
2. Click **New** -> **Web Service**.
3. Select your newly created GitHub repository.

### Step 3: Configure Render Settings
Fill out the configuration page with the following settings:
- **Environment:** `Node`
- **Build Command:** `npm install && npm run build` *(This installs dependencies and builds your Vue frontend into the `dist/` folder)*
- **Start Command:** `npm start` *(This starts your Express server, which serves both your API and your frontend)*

### Step 4: Persistent Database (Optional but Recommended)
If you are using the free tier on Render, your `db.json` file will reset every time the server restarts. 
To prevent this:
1. Go to the **Disks** section in your Render Web Service settings.
2. Add a new disk mounted at the path `/opt/render/project/src/server`.
3. This will ensure your `db.json` file is never deleted when the server goes to sleep.

### Step 5: Telegram Integration
Once your app is successfully deployed, Render will give you a public URL (e.g., `https://your-app-name.onrender.com`).
1. Go to **BotFather** on Telegram.
2. Send `/setmenubutton` and select your bot.
3. Provide your new Render URL as the Web App URL.
4. Now, your Telegram users can access your live application!

8913182935:AAGQMSKLCKSAfXOCSiDZ99O_iu3HMdaNE0I
