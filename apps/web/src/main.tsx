import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { client } from "./lib/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
