import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { MantineProvider, localStorageColorSchemeManager } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { AuthProvider } from "@/contexts/AuthContext";
import AppRoutes from "./routers/routes";
import { COLOR_SCHEME_STORAGE_KEY } from "@/constants";
import { theme } from "./theme";

const colorSchemeManager = localStorageColorSchemeManager({
  key: COLOR_SCHEME_STORAGE_KEY,
});

function App() {
  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme="light"
      colorSchemeManager={colorSchemeManager}
    >
      <DatesProvider settings={{ locale: "en", firstDayOfWeek: 0, weekendDays: [0, 6] }}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </DatesProvider>
    </MantineProvider>
  );
}

export default App;
