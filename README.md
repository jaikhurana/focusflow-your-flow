# FocusFlow Dashboard

Build a modern full-stack web application called "FocusFlow".

Purpose:
A productivity web app for students and professionals to manage tasks, study sessions, and goals.

Tech Requirements:
- React (Next.js preferred)
- TailwindCSS for UI
- Firebase for backend
- Firebase Authentication (Google + Email login)
- Firestore database
- Firebase Hosting ready
- Clean component architecture

Core Features:

1. Authentication
- Google Sign-in
- Email/Password login
- User profile stored in Firestore

2. Dashboard
After login show a dashboard with:
- Today's tasks
- Upcoming deadlines
- Study time tracker
- Productivity stats

3. Task Management
Users should be able to:
- Create tasks
- Set priority (High, Medium, Low)
- Add due date
- Mark tasks complete
- Delete tasks

Store tasks in Firestore under each user.

4. Study Sessions (Pomodoro)
- 25 minute focus timer
- Track completed sessions
- Save sessions to Firestore
- Show daily study time

5. Analytics
Show:
- Tasks completed this week
- Study time graph
- Productivity streak

6. UI Requirements
- Clean modern UI similar to Notion / Linear
- Responsive design
- Sidebar navigation
- Dashboard cards
- Smooth animations

7. Database Structure

Users Collection
- uid
- name
- email
- createdAt

Tasks Collection
- userId
- title
- priority
- dueDate
- completed
- createdAt

Sessions Collection
- userId
- duration
- date

8. Additional
- Dark mode toggle
- Loading states
- Empty states
- Error handling

9. Deployment
Make the project ready for Firebase hosting.

Provide:
- Full folder structure
- Setup instructions
- Firebase config setup steps

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://focusflow-your-flow.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f2638c5e-962e-4637-9281-5c43c60ae766).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
