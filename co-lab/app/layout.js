// app/layout.js
import { AuthContextProvider } from './context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'Co-Lab AI',
  description: 'Collaborative AI Learning Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}