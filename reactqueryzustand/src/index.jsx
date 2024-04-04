import React from "react";
import ReactDOM from 'react-dom/client'
import App from "./components/App";
import './styles/main.styl'
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  BrowserRouter,
} from "react-router-dom";

const queryClient = new QueryClient()

const Index = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

const rootElement = document.getElementById('root')
ReactDOM.createRoot(rootElement).render(<Index />)
