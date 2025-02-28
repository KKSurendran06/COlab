import { AuthContextProvider } from './context/AuthContext';
import Chatbot from './components/Chatbot';
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
          <Chatbot /> 
        </AuthContextProvider>
      </body>
    </html>
  );
}
