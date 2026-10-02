import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button, Center, Group, Stack, Text, Title } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { THEME_BLUE } from "@/constants";

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Catches render errors so a single broken component shows a recovery screen
 * instead of unmounting the whole app (which left users staring at a blank page).
 * Reset by changing its `key` (the router keys it by pathname).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Center mih="100vh" p="xl">
        <Stack align="center" gap="sm" maw={460} ta="center">
          <IconAlertTriangle size={44} color="#f59f00" />
          <Title order={3}>Something went wrong on this page</Title>
          <Text c="dimmed" size="sm">
            Your saved work is safe. Try again, or go back to the previous page. If this keeps
            happening, please let support know what you were doing.
          </Text>
          <Group mt="sm">
            <Button variant="default" onClick={() => window.history.back()}>
              Go back
            </Button>
            <Button bg={THEME_BLUE} onClick={() => this.setState({ error: null })}>
              Try again
            </Button>
          </Group>
        </Stack>
      </Center>
    );
  }
}
