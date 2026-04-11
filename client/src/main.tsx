import ReactDOM from 'react-dom/client';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { setContext } from '@apollo/client/link/context';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Apollo Client link chain: authLink → httpLink
// authLink intercepts every request and attaches the JWT from localStorage
// httpLink sends the request to the /graphql endpoint
const httpLink = createHttpLink({
  uri: '/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApolloProvider>
);
