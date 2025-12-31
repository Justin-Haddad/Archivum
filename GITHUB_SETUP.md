# Connecting Your Project to GitHub

Follow these steps to connect your Archivum project to a GitHub repository.

## Step 1: Initialize Git (if not already done)

Open your terminal in the project directory and run:

```bash
cd /Users/justinhaddad/JusBus-App
git init
```

## Step 2: Add All Files to Git

```bash
git add .
```

## Step 3: Make Your First Commit

```bash
git commit -m "Initial commit: Archivum media tracking app"
```

## Step 4: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **+** icon in the top right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `Archivum` (or `JusBus-App` or whatever you prefer)
   - **Description**: "Media tracking and rating app - Track your favorite movies, shows, books, and games"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (since you already have these)
5. Click **"Create repository"**

## Step 5: Connect Your Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/Archivum.git

# Or if you prefer SSH (if you have SSH keys set up):
# git remote add origin git@github.com:YOUR_USERNAME/Archivum.git
```

## Step 6: Push Your Code to GitHub

```bash
# Rename your default branch to 'main' (if needed)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

## Step 7: Verify Connection

Go to your GitHub repository page and you should see all your files!

## Future Updates

Whenever you make changes and want to push them to GitHub:

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "Description of your changes"

# Push to GitHub
git push
```

## Troubleshooting

### If you get authentication errors:
- GitHub now requires a Personal Access Token instead of passwords
- Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
- Generate a new token with `repo` permissions
- Use this token as your password when pushing

### If you need to change the remote URL:
```bash
# Check current remote
git remote -v

# Update remote URL
git remote set-url origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

### If Command Line Tools error appears:
Run this command to install/update Xcode Command Line Tools:
```bash
xcode-select --install
```

## Optional: Set Up GitHub Actions for Vercel

If you're deploying to Vercel, you can set up automatic deployments:

1. In your Vercel dashboard, go to your project settings
2. Connect it to your GitHub repository
3. Vercel will automatically deploy when you push to the main branch

---

**Note**: Make sure your `.env` file is in `.gitignore` (it should be) so you don't accidentally commit sensitive API keys!



