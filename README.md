# 📊 GitHub Repository Monitor

**GitHub Repository Monitor** is a real-time monitoring dashboard that tracks GitHub repository activities, releases, and development progress. Built with **React 19** and **Vite**, it provides a clean, password-protected interface for non-technical stakeholders to visualize project advancement through commits, branches, and version releases.

*Developed for frameworksoft.io - Version 1.1.0 is now open source*

---

## 📋 Table of Contents

- [Features](#-features)
- [Technologies](#-technologies)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Environment Setup](#-environment-setup)
- [Authentication](#-authentication)
- [API Integration](#-api-integration)
- [Deployment](#-deployment)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ **Features**

- **Real-time Repository Monitoring**: Track commits, branches, and releases
- **Password Protection**: Secure access for each configured repository
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **Auto-refresh**: Updates repository events every 30 seconds
- **Visual Timeline**: Elegant display of repository activities with user avatars
- **Version Display**: Prominent display of the current release version
- **Multi-repository Support**: Configure multiple repositories with individual access

---

## 🚀 **Technologies**

- **React 19.1.0** (Latest React version)
- **Vite 6.3.5** (Lightning-fast build tool)
- **Tailwind CSS 4.1.10** (Utility-first CSS framework)
- **React Router DOM 7.6.2** (Client-side routing)
- **Lucide React** (Modern icon library)
- **GitHub API v3** (Repository data fetching)

---

## 🧩 **Project Structure**

```
github-repo-monitor/
│
├── src/
│   ├── components/
│   │   └── GitHubRepoMonitor.jsx    # Main monitoring component
│   │
│   ├── App.jsx                       # Router configuration
│   ├── main.jsx                      # Application entry point
│   ├── index.css                     # Global styles
│   └── RepoData.js                   # Repository configuration
│
├── public/
│   └── index.html                    # HTML template
│
├── .env.example                      # Environment variables template
├── vite.config.js                    # Vite configuration
├── package.json                      # Dependencies and scripts
└── README.md                         # Documentation
```

---

## ⚙️ **Configuration**

### Repository Setup

Edit `src/RepoData.js` to configure your repositories:

```javascript
const repositories = {
  myproject: {
    owner: 'github-username',
    repo: 'repository-name',
    password: import.meta.env.VITE_PASSWORD_MYPROJECT || 'defaultPass',
    token: import.meta.env.VITE_GITHUB_TOKEN_MYPROJECT || '',
    frameworkPath: 'frameworksoft.io/works/myproject'
  }
};
```

### URL Structure

The monitor is accessible at:
```
https://yourdomain.com/works/{repository-name}
```

---

## 🛠️ **Environment Setup**

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/github-repo-monitor.git
cd github-repo-monitor
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
cp .env.example .env
```

4. **Configure environment variables:**
```env
# GitHub Tokens (Optional for public repos, required for private)
VITE_GITHUB_TOKEN_REACT=ghp_your_token_here
VITE_GITHUB_TOKEN_VUE=ghp_your_token_here

# Access Passwords
VITE_PASSWORD_REACT=your_secure_password
VITE_PASSWORD_VUE=another_secure_password

# Repository Paths
VITE_PATH_REACT=frameworksoft.io/works/react
VITE_PATH_VUE=frameworksoft.io/works/vue
```

### Development Server

```bash
npm run dev
```

Access at: `http://localhost:5173`

---

## 🔐 **Authentication**

Each repository requires password authentication:

1. Navigate to `/works/{repository-name}`
2. Enter the configured password
3. Access is granted to view repository activity

**Password Security:**
- Passwords are stored in environment variables
- Each repository has its own unique password
- No password recovery mechanism (by design)

---

## 🌐 **API Integration**

### GitHub API Endpoints Used

- **Latest Release:** `/repos/{owner}/{repo}/releases/latest`
- **Tags:** `/repos/{owner}/{repo}/tags`
- **Events:** `/repos/{owner}/{repo}/events`

### Rate Limits

- **Without Token:** 60 requests/hour
- **With Token:** 5,000 requests/hour

### Creating GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings
2. Click "Personal access tokens" → "Tokens (classic)"
3. Generate new token with scopes:
   - `public_repo` (for public repositories)
   - `repo` (for private repositories)

---

## 🚀 **Deployment**

### Build for Production

```bash
npm run build
```

### Deployment Options

#### Vercel
```bash
vercel --prod
```

#### Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`

#### Traditional Hosting
Upload the `dist` folder to your web server

### Environment Variables in Production

Configure environment variables in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables
- Traditional: Server configuration files

---

## 🛡️ **Security**

### Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique passwords
   - Rotate GitHub tokens regularly

2. **Access Control**
   - Each repository has individual password protection
   - No user data is stored client-side
   - Sessions are not persisted

3. **API Security**
   - GitHub tokens are only sent to GitHub's API
   - No backend server stores credentials
   - All API calls use HTTPS

### Security Headers

When deploying, configure these headers:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 🤝 **Contributing**

Contributors are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add comments for complex logic
- Update documentation as needed
- Test on multiple screen sizes


---

## 🎯 **Use Cases**

Perfect for:
- **Project Managers**: Track development progress without GitHub access
- **Clients**: View real-time project advancement
- **Stakeholders**: Monitor release cycles and team activity
- **Teams**: Share development status with non-technical members


---

## 📄 **License**

This project is licensed under the MIT License.
