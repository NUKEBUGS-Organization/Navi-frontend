import {
  TextInput,
  PasswordInput,
  Checkbox,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Button,
  Stack,
  Box,
  Grid,
  SimpleGrid,
  Center,
  Image,
  Divider,
  Input,
} from "@mantine/core";

const EmployeeLogin = () => {
  return (
    <Box w="100vw" h="100vh" style={{ overflow: "hidden" }}>
      <SimpleGrid cols={2} spacing={0} h="100%">
        <Stack bg="#0F2B5C" h="100%" justify="center" align="center">
          <Group>
            <Image
              src="/logo.jpeg"
              h={"100px"}
              w={"100px"}
              radius="50%"
            ></Image>

            <Text c="white" mr={"10px"} size="20px" ff="Inter" lh="28px">
              Your Change Navigator.
            </Text>
          </Group>
        </Stack>
        <Stack bg="#FFFFFF" h="100%" justify="center" align="center" gap={"0"}>
          <Title c={"#0F2B5C"}>Welcome back</Title>
          <Text c="#64748B" size="sm">
            Sign in to your organization workspace
          </Text>
          <Divider w={"440px"} mt={"30px"} c={"#E2E8F0"} size={"sm"}></Divider>
          <Stack mt={"25px"} gap={0}>
            <Text c={"#0F2B5C"}>Email</Text>
            <Input
              placeholder="Please Enter your Email"
              w={"440px"}
              styles={{ input: { height: "49px" } }}
            ></Input>
          </Stack>
          <Stack mt={"25px"} gap={0}>
            <Text c={"#0F2B5C"}>Password</Text>
            <PasswordInput
              placeholder="Please Enter your Password"
              w={"440px"}
              styles={{ input: { height: "49px" } }}
            ></PasswordInput>
          </Stack>
          <Group mt={"30px"} w={"440px"} justify="space-between">
            <Checkbox label="Remember me" c={"#0F2B5C"}></Checkbox>
            <Anchor>Forgot Password?</Anchor>
          </Group>
          <Button mt={"30px"} w={"440px"} bg="#00A99D" c="white" h={"50px"}>
            Sign In
          </Button>
          <Divider
            my="xs"
            label="OR"
            labelPosition="center"
            w={"440px"}
            mt={"30px"}
          />
          <Text mt={"30px"}>
            Don't have an account?{" "}
            <Anchor href="signup">Sign Up as an organization</Anchor>
          </Text>
        </Stack>
      </SimpleGrid>
    </Box>
  );
};

export default EmployeeLogin;
