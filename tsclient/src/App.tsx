import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';

import WikiPageContainer from './containers/WikiPageContainer';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WikiPageContainer />
    </QueryClientProvider>
  );
}

export default App;
