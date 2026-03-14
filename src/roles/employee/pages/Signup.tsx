import {
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
  ScrollArea,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { ROUTES, THEME_BLUE } from "@/constants";
import logo from "@/assets/navi-logo.jpeg";

const Signup = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Box w="100vw" h="100vh" style={{ overflow: "hidden" }}>
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
        <ScrollArea h="100%" w="100%">
          <Stack
            bg="#FFFFFF"
            h="100%"
            justify={isMobile ? "flex-start" : "center"}
            align="center"
            gap={"0"}
            py="30px"
            px={isMobile ? "md" : 0}
          >
            <Title c={"#0F2B5C"} fz={isMobile ? 22 : 28} ta="center">
              Tell us about your organization
            </Title>
            <Text c="#64748B" size={isMobile ? "xs" : "sm"} ta="center">
              Submit your details and our team will review and set up your
              workspace.
            </Text>
            <Divider
              w={isMobile ? "100%" : "440px"}
              mt={"30px"}
              c={"#E2E8F0"}
              size={"sm"}
            ></Divider>
            <Stack mt={"25px"} gap={0} w={isMobile ? "100%" : "440px"}>
              <Text c={"#0F2B5C"}>Organization Name</Text>
              <Input
                placeholder="Enter organization name"
                styles={{ input: { height: "49px" } }}
              ></Input>
            </Stack>
            <Stack mt={"25px"} gap={0} w={isMobile ? "100%" : "440px"}>
              <Text c={"#0F2B5C"}>Organization Owner</Text>
              <Input
                placeholder="Enter owner name"
                styles={{ input: { height: "49px" } }}
              ></Input>
            </Stack>
            <Stack mt={"25px"} gap={0} w={isMobile ? "100%" : "440px"}>
              <Text c={"#0F2B5C"}>Email</Text>
              <Input
                placeholder="Please Enter your Email"
                styles={{ input: { height: "49px" } }}
              ></Input>
            </Stack>
            <Stack mt={"25px"} gap={0} w={isMobile ? "100%" : "440px"}>
              <Text c={"#0F2B5C"}>Phone Number</Text>
              <Input
                placeholder="Enter phone number"
                styles={{ input: { height: "49px" } }}
              ></Input>
            </Stack>
            <Stack mt={"25px"} gap={0} w={isMobile ? "100%" : "440px"}>
              <Text c={"#0F2B5C"}>City</Text>
              <Input
                placeholder="Enter city"
                styles={{ input: { height: "49px" } }}
              ></Input>
            </Stack>
            <Stack mt={"25px"} gap={0} w={isMobile ? "100%" : "440px"}>
              <Text c={"#0F2B5C"}>Country</Text>
              <Input
                placeholder="Enter country"
                styles={{ input: { height: "49px" } }}
              ></Input>
            </Stack>
            <Stack mt={"25px"} gap={0} w={isMobile ? "100%" : "440px"}>
              <Text c={"#0F2B5C"}>Industry</Text>
              <Input
                placeholder="Enter industry"
                styles={{ input: { height: "49px" } }}
              ></Input>
            </Stack>
            <Stack mt={"25px"} gap={0} w={isMobile ? "100%" : "440px"}>
              <Text c={"#0F2B5C"}>Number of Employees</Text>
              <Input
                placeholder="Enter number of employees"
                styles={{ input: { height: "49px" } }}
              ></Input>
            </Stack>

            <Button
              mt={"30px"}
              w={isMobile ? "100%" : "440px"}
              bg="#00A99D"
              c="white"
              h={"50px"}
            >
              Sign Up
            </Button>
            <Divider
              my="xs"
              label="OR"
              labelPosition="center"
              w={isMobile ? "100%" : "440px"}
              mt={"30px"}
            />
            <Text mt={"30px"} mb={"30px"} ta="center">
              Already have an account?{" "}
              <Anchor href={ROUTES.AUTH_LOGIN}>Sign In</Anchor>
            </Text>
          </Stack>
        </ScrollArea>
      </SimpleGrid>
    </Box>
  );
};

export default Signup;
