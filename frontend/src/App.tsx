import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { DashboardPage } from '@/pages';
import { ThemeProvider } from '@/providers';
import { PageBackground } from '@/components/shared';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="wind-ui-theme">
      <PageBackground />
      <Toaster position="bottom-right" closeButton={true} />
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <DashboardPage />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
