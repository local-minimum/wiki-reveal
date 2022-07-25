import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';

import WikiPage from './components/WikiPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WikiPage />
    </QueryClientProvider>
  );
}

export default App;
