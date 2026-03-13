import "@mantine/core/styles.css";
import { MantineProvider, createTheme } from "@mantine/core";
import AppRoutes from "./routers/routes";

const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "md",
  fontFamily: "Inter, sans-serif",
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <AppRoutes />
    </MantineProvider>
  );
}

export default App;
