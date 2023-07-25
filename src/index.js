import React from 'react';
import ReactDOM from 'react-dom';
import HttpsRedirect from 'react-https-redirect';
import App from './App';
import { ContextProvider } from './Context';

import './styles.css';

ReactDOM.render(
  <ContextProvider>
    <HttpsRedirect>
      <App />
    </HttpsRedirect>
  </ContextProvider>,
  document.getElementById('root'),
);
