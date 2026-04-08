import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/roles/admin/layout/AdminLayout";
import {
  Box,
  Title,
  Text,
  Group,
  Button,
  rem,
  Card,
  Badge,
  Avatar,
  Stack,
  TextInput,
  PasswordInput,
  Grid,
  Divider,
  ActionIcon,
  Center,
  Progress,
  Loader,
  Paper,
  ScrollArea,
} from "@mantine/core";
import {
  IconCamera,
  IconUser,
  IconLock,
  IconStar,
  IconLogout,
} from "@tabler/icons-react";
import { ROUTES, THEME_BLUE, TEAL_BLUE, setStoredUser } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { useAppRoutes } from "@/hooks/useAppRoutes";
import { getMyOrganization } from "@/api/organizations";
import type { MyOrganization } from "@/api/organizations";
import { getKudosSummary, type KudosSummary } from "@/api/kudos";
import {
  listMyInitiativeParticipations,
  type MyInitiativeParticipation,
} from "@/api/initiatives";
import { updateMyProfile } from "@/api/auth";

function getInitials(name: string | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatRole(role: string | undefined): string {
  if (!role) return "—";
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function roleLabel(r: MyInitiativeParticipation["roles"][number]): string {
  if (r === "lead") return "Change lead";
  if (r === "raci") return "RACI";
  return "Assigned tasks";
}

function roleBadgeColor(r: MyInitiativeParticipation["roles"][number]): string {
  if (r === "lead") return "teal";
  if (r === "raci") return "blue";
  return "gray";
}

/** Downscale and JPEG-compress so the data URL fits API limits and avoids default ~100kb JSON issues on small servers. */
async function imageFileToProfileDataUrl(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const maxEdge = 512;
  const scale = Math.min(1, maxEdge / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bmp.close();
    throw new Error("Could not process this image in the browser.");
  }
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  let quality = 0.88;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > 420_000 && quality > 0.5) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  if (dataUrl.length > 450_000) {
    throw new Error("Image is still too large after compression. Try a smaller file.");
  }
  return dataUrl;
}

export default function AdminSettings() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const appRoutes = useAppRoutes();
  const [org, setOrg] = useState<MyOrganization | null>(null);
  const [kudos, setKudos] = useState<KudosSummary | null>(null);
  const [participations, setParticipations] = useState<MyInitiativeParticipation[]>([]);
  const [profileExtrasLoading, setProfileExtrasLoading] = useState(true);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMyOrganization()
      .then(setOrg)
      .catch(() => setOrg(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setProfileExtrasLoading(true);
    Promise.all([
      getKudosSummary().catch(() => null),
      listMyInitiativeParticipations().catch(() => []),
    ])
      .then(([k, parts]) => {
        if (cancelled) return;
        setKudos(k);
        setParticipations(Array.isArray(parts) ? parts : []);
      })
      .finally(() => {
        if (!cancelled) setProfileExtrasLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const nameParts = user?.name?.trim()?.split(/\s+/) ?? [];
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") ?? "";
  const departmentsDisplay = user?.departments?.length ? user.departments.join(", ") : "—";

  const handlePhotoPick = async (file: File | null) => {
    if (!file || !user) return;
    const maxFile = 8 * 1024 * 1024;
    if (file.size > maxFile) {
      setPhotoError("File is too large (max 8MB).");
      return;
    }
    setPhotoBusy(true);
    setPhotoError(null);
    try {
      const photoDataUrl = await imageFileToProfileDataUrl(file);
      const updated = await updateMyProfile({ photoDataUrl });
      const merged = { ...user, ...updated };
      setUser(merged);
      setStoredUser(merged as unknown as Record<string, unknown>);
    } catch (e) {
      const msg =
        e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string"
          ? (e as { message: string }).message
          : "Could not update profile photo. Check your connection and try again.";
      setPhotoError(msg);
    } finally {
      setPhotoBusy(false);
    }
  };

  return (
    <AdminLayout>
      <Box style={{ width: "100%" }}>
        <Grid gutter={30} align="flex-start">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card
              withBorder
              radius="lg"
              p={40}
              shadow="xs"
              h="100%"
              ta="center"
            >
              <Center mb="lg">
                <Box style={{ position: "relative" }}>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      e.target.value = "";
                      void handlePhotoPick(f);
                    }}
                  />
                  <Avatar
                    key={user?.photoDataUrl ? `p-${user.photoDataUrl.length}` : "no-photo"}
                    size={rem(120)}
                    radius={rem(60)}
                    bg={THEME_BLUE}
                    c="white"
                    fz={rem(40)}
                    fw={700}
                    src={user?.photoDataUrl || undefined}
                  >
                    {getInitials(user?.name)}
                  </Avatar>
                  <ActionIcon
                    variant="filled"
                    bg={TEAL_BLUE}
                    size="lg"
                    radius="xl"
                    style={{
                      position: "absolute",
                      bottom: 5,
                      right: 5,
                      border: "3px solid white",
                    }}
                    loading={photoBusy}
                    onClick={() => photoInputRef.current?.click()}
                  >
                    <IconCamera size={18} />
                  </ActionIcon>
                </Box>
              </Center>

              {photoError && (
                <Text size="sm" c="red" mb="sm" px="md">
                  {photoError}
                </Text>
              )}

              <Title order={2} fw={800} fz={rem(24)} mb={5}>
                {user?.name ?? "—"}
              </Title>
              <Badge
                variant="light"
                color="teal"
                radius="xl"
                px="lg"
                py="md"
                fw={800}
                fz={10}
              >
                {formatRole(user?.role)}
              </Badge>

              <Divider my={30} color="#f1f3f5" />

              <Stack gap="xl" align="flex-start">
                <Box ta="left" style={{ width: "100%" }}>
                  <Text fz={10} fw={800} c="dimmed" lts={1} mb={4}>
                    EMAIL ADDRESS
                  </Text>
                  <Text fz="sm" fw={600}>
                    {user?.email ?? "—"}
                  </Text>
                </Box>
                <Box ta="left" style={{ width: "100%" }}>
                  <Text fz={10} fw={800} c="dimmed" lts={1} mb={4}>
                    ORGANIZATION
                  </Text>
                  <Text fz="sm" fw={600}>
                    {org?.name ?? "—"}
                  </Text>
                </Box>
                <Box ta="left" style={{ width: "100%" }}>
                  <Text fz={10} fw={800} c="dimmed" lts={1} mb={4}>
                    DEPARTMENT(S)
                  </Text>
                  <Text fz="sm" fw={600}>
                    {departmentsDisplay}
                  </Text>
                </Box>

                <Divider color="#f1f3f5" />

                <Box ta="left" style={{ width: "100%" }}>
                  <Group gap={8} mb={8}>
                    <IconStar size={18} color={TEAL_BLUE} fill={TEAL_BLUE} />
                    <Text fz={10} fw={800} c="dimmed" lts={1}>
                      KUDOS STARS
                    </Text>
                  </Group>
                  {profileExtrasLoading ? (
                    <Loader size="sm" />
                  ) : (
                    <>
                      <Text fz={rem(32)} fw={800} c={THEME_BLUE} lh={1.1}>
                        {kudos?.totalStars ?? 0}
                      </Text>
                      <Text fz="xs" c="dimmed" mt={6}>
                        System {kudos?.systemStars ?? 0} · Manager {kudos?.managerStars ?? 0}
                      </Text>
                      <Text fz="xs" c="dimmed" mt={8} style={{ lineHeight: 1.45 }}>
                        Stars are earned when you complete roadmap tasks, add comments, or submit
                        assessments on initiatives.
                      </Text>
                    </>
                  )}
                </Box>
              </Stack>

              <Button
                variant="filled"
                bg="#f1f3f5"
                c="#495057"
                radius="md"
                mt={40}
                h={50}
                fw={700}
                fullWidth
                loading={photoBusy}
                onClick={() => photoInputRef.current?.click()}
              >
                Upload new photo
              </Button>
              <Button
                variant="outline"
                color="red"
                radius="md"
                mt="md"
                h={50}
                fw={700}
                fullWidth
                leftSection={<IconLogout size={18} />}
                onClick={() => {
                  logout();
                  navigate(ROUTES.AUTH_LOGIN, { replace: true });
                }}
              >
                Log out
              </Button>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap={30}>
              <Card withBorder radius="lg" p={0} shadow="xs">
                <Box p="xl">
                  <Group gap="sm" mb="xl">
                    <IconUser size={22} color={TEAL_BLUE} stroke={2.5} />
                    <Title order={4} fw={800}>
                      Personal Information
                    </Title>
                  </Group>
                  <Divider mb="xl" color="#f1f3f5" />
                  <Grid gutter="xl">
                    <Grid.Col span={6}>
                      <SettingInput label="FIRST NAME" defaultValue={firstName} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <SettingInput label="LAST NAME" defaultValue={lastName} />
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <Text fz={10} fw={800} c="dimmed" lts={1} mb={8}>
                        DEPARTMENT(S)
                      </Text>
                      <Text fz="sm" fw={600}>
                        {departmentsDisplay}
                      </Text>
                    </Grid.Col>
                  </Grid>
                </Box>
              </Card>

              <Card withBorder radius="lg" p={0} shadow="xs">
                <Box p="xl">
                  <Group gap="sm" mb="xl">
                    <IconStar size={22} color={TEAL_BLUE} stroke={2.5} />
                    <Title order={4} fw={800}>
                      Your initiatives
                    </Title>
                  </Group>
                  <Divider mb="xl" color="#f1f3f5" />
                  {profileExtrasLoading ? (
                    <Center py="xl">
                      <Loader />
                    </Center>
                  ) : participations.length === 0 ? (
                    <Text fz="sm" c="dimmed">
                      You are not linked to any initiatives yet. You will appear here when you are
                      the change lead, listed on RACI, or assigned to roadmap tasks.
                    </Text>
                  ) : (
                    <ScrollArea.Autosize mah={380} offsetScrollbars>
                      <Stack gap="md">
                        {participations.map((p) => (
                          <Paper
                            key={p.id}
                            withBorder
                            p="md"
                            radius="md"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(appRoutes.INITIATIVE_DETAIL(p.id))}
                          >
                            <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
                              <Box style={{ minWidth: 0, flex: 1 }}>
                                <Text fw={700} size="sm" lineClamp={2}>
                                  {p.title}
                                </Text>
                                <Group gap={6} mt={8} wrap="wrap">
                                  {p.roles.map((r) => (
                                    <Badge
                                      key={r}
                                      size="xs"
                                      variant="light"
                                      color={roleBadgeColor(r)}
                                      tt="none"
                                    >
                                      {roleLabel(r)}
                                    </Badge>
                                  ))}
                                  <Badge size="xs" variant="outline" color="gray" tt="none">
                                    {p.status}
                                  </Badge>
                                </Group>
                              </Box>
                              <Text fz="sm" fw={800} c="dimmed" style={{ flexShrink: 0 }}>
                                {p.progress}%
                              </Text>
                            </Group>
                            <Progress value={p.progress} size={4} mt={10} color={THEME_BLUE} radius="xl" />
                          </Paper>
                        ))}
                      </Stack>
                    </ScrollArea.Autosize>
                  )}
                </Box>
              </Card>

              <Card withBorder radius="lg" p={0} shadow="xs">
                <Box p="xl">
                  <Group gap="sm" mb="xl">
                    <IconLock size={22} color={TEAL_BLUE} stroke={2.5} />
                    <Title order={4} fw={800}>
                      Security & Password
                    </Title>
                  </Group>
                  <Divider mb="xl" color="#f1f3f5" />
                  <Grid gutter="xl">
                    <Grid.Col span={6}>
                      <SettingPasswordInput
                        label="CURRENT PASSWORD"
                        placeholder="Enter current password"
                        ariaLabelToggle="Show or hide current password"
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <SettingPasswordInput
                        label="NEW PASSWORD"
                        placeholder="Enter new password"
                        ariaLabelToggle="Show or hide new password"
                      />
                    </Grid.Col>
                  </Grid>
                  <Text
                    fz="xs"
                    c="dimmed"
                    fw={500}
                    mt="lg"
                    style={{ lineHeight: 1.5 }}
                  >
                    Password must be at least 12 characters and include at least
                    one uppercase letter, one number, and one special character.
                  </Text>
                </Box>
              </Card>

              <Group justify="flex-end" gap="xl" mt="xl" pb={40}>
                <Button variant="transparent" c="gray.6" fw={700} size="md">
                  Cancel
                </Button>
                <Button
                  bg={THEME_BLUE}
                  radius="md"
                  h={50}
                  px={50}
                  fw={700}
                  size="md"
                >
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
      </Box>
    </AdminLayout>
  );
}

function SettingInput({
  label,
  defaultValue,
  placeholder,
}: {
  label: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <TextInput
      label={
        <Text fw={800} fz={10} c="dimmed" lts={1} mb={8}>
          {label}
        </Text>
      }
      defaultValue={defaultValue}
      placeholder={placeholder}
      radius="md"
      size="md"
      styles={{
        input: { backgroundColor: "#f8f9fa" },
      }}
    />
  );
}

function SettingPasswordInput({
  label,
  placeholder,
  ariaLabelToggle,
}: {
  label: string;
  placeholder?: string;
  ariaLabelToggle: string;
}) {
  return (
    <PasswordInput
      label={
        <Text fw={800} fz={10} c="dimmed" lts={1} mb={8}>
          {label}
        </Text>
      }
      placeholder={placeholder}
      radius="md"
      size="md"
      visibilityToggleButtonProps={{ "aria-label": ariaLabelToggle }}
      styles={{
        input: { backgroundColor: "#f8f9fa" },
      }}
    />
  );
}
