import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import * as React from 'react';

import WikiPageContainer from './containers/WikiPageContainer';

const queryClient = new QueryClient();

function fitHeight(): void {
  document.body.style.height = `${window.innerHeight}px`;
}

function App() {
  React.useEffect(() => {
    window.addEventListener('resize', fitHeight);
    fitHeight();
    return () => window.removeEventListener('resize', fitHeight);
  }, []);

  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      preventDuplicate
      autoHideDuration={2500}
    >
      <QueryClientProvider client={queryClient}>
        <WikiPageContainer />
      </QueryClientProvider>
    </SnackbarProvider>
  );
}

export default App;
