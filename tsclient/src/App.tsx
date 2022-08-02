import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import * as React from 'react';

import WikiPageContainer from './containers/WikiPageContainer';

const queryClient = new QueryClient();

function App() {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      preventDuplicate
    >
      <QueryClientProvider client={queryClient}>
        <WikiPageContainer />
      </QueryClientProvider>
    </SnackbarProvider>
  );
}

export default App;
