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
import { ROUTES, THEME_BLUE } from "@/constants";
import logo from "@/assets/navi-logo.jpeg";

const Signup = () => {
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
        <ScrollArea h="100%" w="100%">
          <Stack
            bg="#FFFFFF"
            h="100%"
            justify="center"
            align="center"
            gap={"0"}
            py="30px"
          >
            <Title c={"#0F2B5C"}>Tell us about your organization</Title>
            <Text c="#64748B" size="sm">
              Submit your details and our team will review and set up your workspace.
            </Text>
            <Divider
              w={"440px"}
              mt={"30px"}
              c={"#E2E8F0"}
              size={"sm"}
            ></Divider>
            <Stack mt={"25px"} gap={0}>
              <Text c={"#0F2B5C"}>Organization Name</Text>
              <Input
                placeholder="Enter organization name"
                w={"440px"}
                styles={{ input: { height: "49px" } }}
              ></Input>
            </Stack>
            <Stack mt={"25px"} gap={0}>
              <Text c={"#0F2B5C"}>Organization Owner</Text>
              <Input
                placeholder="Enter owner name"
                w={"440px"}
                styles={{ input: { height: "49px" } }}
              ></Input>
            </Stack>
            <Stack mt={"25px"} gap={0}>
              <Text c={"#0F2B5C"}>Email</Text>
              <Input
                placeholder="Please Enter your Email"
                w={"440px"}
                styles={{ input: { height: "49px" } }}
              ></Input>
            </Stack>
            <Stack mt={"25px"} gap={0}>
              <Text c={"#0F2B5C"}>Phone Number</Text>
              <Input
                placeholder="Enter phone number"
                w={"440px"}
                styles={{ input: { height: "49px" } }}
              ></Input>
            </Stack>
            <Stack mt={"25px"} gap={0}>
              <Text c={"#0F2B5C"}>City</Text>
              <Input
                placeholder="Enter city"
                w={"440px"}
                styles={{ input: { height: "49px" } }}
              ></Input>
            </Stack>
            <Stack mt={"25px"} gap={0}>
              <Text c={"#0F2B5C"}>Country</Text>
              <Input
                placeholder="Enter country"
                w={"440px"}
                styles={{ input: { height: "49px" } }}
              ></Input>
            </Stack>
            <Stack mt={"25px"} gap={0}>
              <Text c={"#0F2B5C"}>Industry</Text>
              <Input
                placeholder="Enter industry"
                w={"440px"}
                styles={{ input: { height: "49px" } }}
              ></Input>
            </Stack>
            <Stack mt={"25px"} gap={0}>
              <Text c={"#0F2B5C"}>Number of Employees</Text>
              <Input
                placeholder="Enter number of employees"
                w={"440px"}
                styles={{ input: { height: "49px" } }}
              ></Input>
            </Stack>

            <Button mt={"30px"} w={"440px"} bg="#00A99D" c="white" h={"50px"}>
              Sign Up
            </Button>
            <Divider
              my="xs"
              label="OR"
              labelPosition="center"
              w={"440px"}
              mt={"30px"}
            />
            <Text mt={"30px"} mb={"30px"}>
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
