# React Task Management App

A comprehensive React task management application with calendar functionality, recurring tasks, and collaborative features.

## 🚀 Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Supabase** for backend (database, auth)

## 🔧 Setup & Installation

1. Clone the repository:
```bash
git clone https://github.com/skinnynoizze/work-calendar-todo.git
cd work-calendar-todo
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Start the development server:
```bash
npm run dev
```

## 🔒 Security Note

- Never commit `.env` files to the repository
- The `.env` file is already included in `.gitignore`
- Use `VITE_` prefix for environment variables in Vite
- Store sensitive credentials securely

## ✨ Features

- 📅 **Calendar View** - Monthly calendar with task visualization
- ✅ **Task Management** - Create, edit, delete, and complete tasks
- 🔄 **Recurring Tasks** - Daily, weekly, monthly patterns with custom intervals
- 🏷️ **Categories** - Color-coded task categorization with autocomplete
- ⭐ **Priority System** - High, medium, low priority with visual indicators
- 📊 **Dashboard** - Statistics and weekly overview
- 💾 **Data Persistence** - Local storage with Supabase integration planned

## 🎨 UI Features

- Responsive design with Tailwind CSS
- Modern, clean interface
- Color-coded priority system (border colors)
- Category-based background colors
- Intuitive calendar navigation

## 🚀 Deployment

The app is deployed on Netlify: [work-calendar-todo.netlify.app](https://work-calendar-todo.netlify.app)

## 📱 Future Enhancements

- [ ] User authentication
- [ ] Team collaboration
- [ ] Mobile app
- [ ] Advanced reporting
- [ ] Task templates 