import "@mantine/core/styles.css";
import { MantineProvider, createTheme } from "@mantine/core";
import { AuthProvider } from "@/contexts/AuthContext";
import AppRoutes from "./routers/routes";

const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "md",
  fontFamily: "Inter, sans-serif",
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;
