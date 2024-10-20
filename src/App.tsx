import './index.css'

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import { ThemeProvider } from "@/components/theme-provider"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from './components/ui/toaster';
import {DataProvider} from "./contexts/data.jsx";

const App = () => {
  const router = createBrowserRouter(routes);
  const queryClient = new QueryClient()

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools />
        <DataProvider>
            <RouterProvider router={router}/>
          <Toaster />
        </DataProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App