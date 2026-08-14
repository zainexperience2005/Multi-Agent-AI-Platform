import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { store } from "./redux/store"

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { App } from "./App"

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </Provider>
)
