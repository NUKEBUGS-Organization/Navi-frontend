import {
  PasswordInput,
  Checkbox,
  Anchor,
  Title,
  Text,
  Group,
  Button,
  Stack,
  Box,
  SimpleGrid,
  Image,
  Divider,
  Input,
} from "@mantine/core";
import { ROUTES, THEME_BLUE } from "@/constants";
import logo from "@/assets/navi-logo.jpeg";
import { useNavigate } from "react-router-dom";

const EmployeeLogin = () => {
  const navigate = useNavigate();

  return (
    <Box w="100vw" h="100vh" style={{ overflow: "hidden" }}>
      <SimpleGrid cols={2} spacing={0} h="100%">
        <Stack bg={THEME_BLUE} h="100%" justify="center" align="center">
          <Group>
            <Image
              src={logo}
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
            Sign in to your Navi account
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
            <Anchor href={ROUTES.AUTH_SIGNUP}>Submit an organization request</Anchor>
          </Text>
          <Button
            mt={"16px"}
            w={"440px"}
            variant="outline"
            color={THEME_BLUE}
            h={"46px"}
            radius="md"
            onClick={() => {
              navigate(ROUTES.ADMIN_DASHBOARD);
            }}
          >
            Open Admin Dashboard
          </Button>
          <Button
            mt={"16px"}
            w={"440px"}
            variant="outline"
            color={THEME_BLUE}
            h={"46px"}
            radius="md"
            onClick={() => {
              navigate(ROUTES.SUPER_ADMIN_DASHBOARD);
            }}
          >
            Open Super Admin Dashboard
          </Button>
        </Stack>
      </SimpleGrid>
    </Box>
  );
};

export default EmployeeLogin;
