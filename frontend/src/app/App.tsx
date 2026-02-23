import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from './contexts/theme-context';
import { BadgeUnlockProvider } from './contexts/badge-context';
import { BadgePopup } from './components/BadgePopup';

export default function App() {
  return (
    <ThemeProvider>
      <BadgeUnlockProvider>
        <RouterProvider router={router} />
        <BadgePopup />
      </BadgeUnlockProvider>
    </ThemeProvider>
  );
}