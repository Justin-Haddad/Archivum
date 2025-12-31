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

### If you get authentication errors (like "Invalid username or token"):

**GitHub requires a Personal Access Token instead of passwords.** Here's how to fix it:

#### Step 1: Create a Personal Access Token

1. Go to [GitHub.com](https://github.com) and sign in
2. Click your profile picture (top right) → **Settings**
3. Scroll down to **Developer settings** (left sidebar, near bottom)
4. Click **Personal access tokens** → **Tokens (classic)**
5. Click **Generate new token** → **Generate new token (classic)**
6. Fill in:
   - **Note**: "Archivum Project" (or any description)
   - **Expiration**: Choose how long (90 days, 1 year, or no expiration)
   - **Scopes**: Check **`repo`** (this gives full repository access)
7. Click **Generate token** at the bottom
8. **IMPORTANT**: Copy the token immediately! It looks like `ghp_xxxxxxxxxxxxxxxxxxxx` - you won't see it again!

#### Step 2: Use the Token When Pushing

When you run `git push`, it will ask for:
- **Username**: Your GitHub username (e.g., `Justin-Haddad`)
- **Password**: Paste your Personal Access Token (NOT your GitHub password)

#### Alternative: Store Credentials (Easier for Future)

You can configure git to remember your token:

```bash
# Store credentials in macOS Keychain (recommended)
git config --global credential.helper osxkeychain

# Then when you push, enter your token once and it will be saved
git push -u origin main
```

#### Alternative 2: Use SSH Instead (Most Secure)

If you prefer SSH authentication:

1. Generate an SSH key (if you don't have one):
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # Press Enter to accept default location
   # Optionally set a passphrase
   ```

2. Copy your public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   # Copy the entire output
   ```

3. Add to GitHub:
   - Go to GitHub Settings → SSH and GPG keys
   - Click "New SSH key"
   - Paste your public key
   - Save

4. Change your remote URL to use SSH:
   ```bash
   git remote set-url origin git@github.com:Justin-Haddad/Archivum.git
   git push -u origin main
   ```

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



