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
  ScrollArea,
  TextInput,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";
import { ROUTES, THEME_BLUE } from "@/constants";
import logo from "@/assets/navi-logo.jpeg";
import { submitOrganizationSignupRequest } from "@/api/organizations";

const Signup = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationContact, setOrganizationContact] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [industry, setIndustry] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);
    if (!organizationName.trim() || !organizationContact.trim() || !email.trim()) {
      setError("Organization name, contact name, and work email are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitOrganizationSignupRequest({
        organizationName: organizationName.trim(),
        organizationContact: organizationContact.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
        industry: industry.trim() || undefined,
        employeeCount: employeeCount.trim() || undefined,
      });
      setMessage(res.message ?? "Thanks — our team will review your request.");
      setOrganizationName("");
      setOrganizationContact("");
      setEmail("");
      setPhoneNumber("");
      setCity("");
      setCountry("");
      setIndustry("");
      setEmployeeCount("");
    } catch (e) {
      setError((e as { message?: string }).message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
            />

            <Text
              c="white"
              mr={"10px"}
              size={isMobile ? "16px" : "20px"}
              ff="'Montserrat', sans-serif"
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
              Submit your details and our team will review and set up your workspace.
            </Text>
            <Divider
              w={isMobile ? "100%" : "440px"}
              mt={"30px"}
              c={"#E2E8F0"}
              size={"sm"}
            />
            {message && (
              <Text c="teal.7" size="sm" mt="md" maw={440} ta="center">
                {message}
              </Text>
            )}
            {error && (
              <Text c="red.7" size="sm" mt="md" maw={440} ta="center">
                {error}
              </Text>
            )}
            <Stack mt={"25px"} gap={0} w={isMobile ? "100%" : "440px"}>
              <Text c={"#0F2B5C"}>Organization Name</Text>
              <TextInput
                placeholder="Enter organization name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.currentTarget.value)}
                styles={{ input: { height: "49px" } }}
              />
            </Stack>
            <Stack mt={"25px"} gap={0} w={isMobile ? "100%" : "440px"}>
              <Text c={"#0F2B5C"}>Organization Contact</Text>
              <TextInput
                placeholder="Enter primary contact name"
                value={organizationContact}
                onChange={(e) => setOrganizationContact(e.currentTarget.value)}
                styles={{ input: { height: "49px" } }}
              />
            </Stack>
            <Stack mt={"25px"} gap={0} w={isMobile ? "100%" : "440px"}>
              <Text c={"#0F2B5C"}>Organization & admin email</Text>
              <Text c="#64748B" size="xs" mb={4}>
                One address for your organization and the admin account we&apos;ll create for you.
              </Text>
              <TextInput
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                styles={{ input: { height: "49px" } }}
              />
            </Stack>
            <Stack mt={"25px"} gap={0} w={isMobile ? "100%" : "440px"}>
              <Text c={"#0F2B5C"}>Phone Number</Text>
              <TextInput
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.currentTarget.value)}
                styles={{ input: { height: "49px" } }}
              />
            </Stack>
            <Stack mt={"25px"} gap={0} w={isMobile ? "100%" : "440px"}>
              <Text c={"#0F2B5C"}>City</Text>
              <TextInput
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.currentTarget.value)}
                styles={{ input: { height: "49px" } }}
              />
            </Stack>
            <Stack mt={"25px"} gap={0} w={isMobile ? "100%" : "440px"}>
              <Text c={"#0F2B5C"}>Country</Text>
              <TextInput
                placeholder="Enter country"
                value={country}
                onChange={(e) => setCountry(e.currentTarget.value)}
                styles={{ input: { height: "49px" } }}
              />
            </Stack>
            <Stack mt={"25px"} gap={0} w={isMobile ? "100%" : "440px"}>
              <Text c={"#0F2B5C"}>Industry</Text>
              <TextInput
                placeholder="Enter industry"
                value={industry}
                onChange={(e) => setIndustry(e.currentTarget.value)}
                styles={{ input: { height: "49px" } }}
              />
            </Stack>
            <Stack mt={"25px"} gap={0} w={isMobile ? "100%" : "440px"}>
              <Text c={"#0F2B5C"}>Number of Employees</Text>
              <TextInput
                placeholder="Enter number of employees"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.currentTarget.value)}
                styles={{ input: { height: "49px" } }}
              />
            </Stack>

            <Button
              mt={"30px"}
              w={isMobile ? "100%" : "440px"}
              bg="#00A99D"
              c="white"
              h={"50px"}
              loading={submitting}
              onClick={handleSubmit}
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
