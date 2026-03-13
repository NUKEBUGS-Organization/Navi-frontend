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
import { useMediaQuery } from "@mantine/hooks";
import { ROUTES, THEME_BLUE } from "@/constants";
import logo from "@/assets/navi-logo.jpeg";
import { useNavigate } from "react-router-dom";

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Box
      w="100vw"
      h="100vh"
      style={{
        overflow: "hidden",
      }}
    >
      <SimpleGrid
        cols={isMobile ? 1 : 2}
        spacing={0}
        h="100%"
        style={{
          gridTemplateRows: isMobile ? "auto 1fr" : undefined,
        }}
      >
        <Stack
          bg={THEME_BLUE}
          h="100%"
          justify="center"
          align="center"
          px={isMobile ? "md" : 0}
          py={isMobile ? "lg" : 0}
        >
          <Group>
            <Image
              src={logo}
              h={isMobile ? "72px" : "100px"}
              w={isMobile ? "72px" : "100px"}
              radius="50%"
            ></Image>

            <Text
              c="white"
              mr={"10px"}
              size={isMobile ? "16px" : "20px"}
              ff="Inter"
              lh="28px"
            >
              Your Change Navigator.
            </Text>
          </Group>
        </Stack>
        <Stack
          bg="#FFFFFF"
          h="100%"
          justify={isMobile ? "flex-start" : "center"}
          align="center"
          gap={"0"}
          px={isMobile ? "md" : 0}
          py={isMobile ? "lg" : 0}
        >
          <Title c={"#0F2B5C"} fz={isMobile ? 22 : 28}>
            Welcome back
          </Title>
          <Text c="#64748B" size={isMobile ? "xs" : "sm"}>
            Sign in to your Navi account
          </Text>
          <Divider
            w={isMobile ? "100%" : "440px"}
            mt={"30px"}
            c={"#E2E8F0"}
            size={"sm"}
          ></Divider>
          <Stack mt={"25px"} gap={0} w={isMobile ? "100%" : "440px"}>
            <Text c={"#0F2B5C"}>Email</Text>
            <Input
              placeholder="Please Enter your Email"
              styles={{ input: { height: "49px" } }}
            ></Input>
          </Stack>
          <Stack mt={"25px"} gap={0} w={isMobile ? "100%" : "440px"}>
            <Text c={"#0F2B5C"}>Password</Text>
            <PasswordInput
              placeholder="Please Enter your Password"
              styles={{ input: { height: "49px" } }}
            ></PasswordInput>
          </Stack>
          <Group
            mt={"30px"}
            w={isMobile ? "100%" : "440px"}
            justify="space-between"
            wrap="wrap"
            gap="xs"
          >
            <Checkbox label="Remember me" c={"#0F2B5C"}></Checkbox>
            <Anchor>Forgot Password?</Anchor>
          </Group>
          <Button
            mt={"30px"}
            w={isMobile ? "100%" : "440px"}
            bg="#00A99D"
            c="white"
            h={"50px"}
          >
            Sign In
          </Button>
          <Divider
            my="xs"
            label="OR"
            labelPosition="center"
            w={isMobile ? "100%" : "440px"}
            mt={"30px"}
          />
          <Text mt={"30px"} ta="center">
            Don't have an account?{" "}
            <Anchor href={ROUTES.AUTH_SIGNUP}>
              Submit an organization request
            </Anchor>
          </Text>
          <Button
            mt={"16px"}
            w={isMobile ? "100%" : "440px"}
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
            w={isMobile ? "100%" : "440px"}
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
