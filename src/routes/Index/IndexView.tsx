import { Add, Check, Checklist, SettingsOutlined } from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Fade,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import dayjs from "dayjs";
import { useAtom } from "jotai";
import type { FormEvent } from "react";
import { Form, Link, useFetcher, useLoaderData, useNavigate, useNavigation, useRevalidator } from "react-router-dom";
import HabitNotificationIndicator from "../../components/HabitNotificationIndicator";
import LinearProgressWithLabel from "../../components/LinearProgressWithLabel";
import { iconMap } from "../../constants/iconMap";
import { fetchAllHabits, registerHabitsNow } from "../../services/habitsPersistance";
import { checkedHabitIdsAtom, registrationAtom, store, userDayStartsAtAtom, userWeekStartsAtMondayAtom } from "../../store";
import { FrequencyUnit } from "../../types/FrequencyUnit";
import { Habit } from "../../types/Habit";
import { getProgress, getProgressBuffer, showSnackBar, toFriendlyFrequency } from "../../utils/helpers";
import { ambientPageSx, contentLayerSx, glassPanelSx } from "../../styles/designLanguage";
import { alphaOrFallback, readableHabitColor } from "../../utils/color";
import RegisterAction from "../../components/RegisterAction";
import { createRegistrationBatch, projectRegistration, REGISTRATION_FETCHER_KEY, restoreRegistrationSelection } from "../../utils/habitRegistration";

async function loader() {
  try {
    return { habits: await fetchAllHabits() };
  } catch (error) {
    const registration = store.get(registrationAtom);
    if (!registration?.acknowledged) throw error;
    // A failed refresh must not erase a confirmed check-in or offer a duplicate retry.
    return { habits: projectRegistration(registration.batch.before, registration), refreshFailed: true };
  }
}

async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const registration = store.get(registrationAtom);
  if (registration?.phase !== "saving" || formData.get("registrationId") !== registration.batch.id) {
    return { ok: false };
  }
  const { batch } = registration;
  try {
    await registerHabitsNow(batch.habitIds, batch.timestamp);
    if (store.get(registrationAtom)?.batch.id === batch.id) store.set(registrationAtom, { ...registration, acknowledged: true });
    return { ok: true };
  } catch (error) {
    console.error("Habit registration failed", error);
    if (store.get(registrationAtom)?.batch.id === batch.id) {
      store.set(checkedHabitIdsAtom, restoreRegistrationSelection(store.get(checkedHabitIdsAtom), batch));
      store.set(registrationAtom, { ...registration, phase: "error" });
    }
    return { ok: false };
  }
}

IndexView.loader = loader;
IndexView.action = action;

export default function IndexView() {
  const theme = useTheme();
  const { habits: loadedHabits, refreshFailed } = useLoaderData() as { habits: Habit[]; refreshFailed?: boolean };
  const revalidator = useRevalidator();
  const [registration] = useAtom(registrationAtom);
  const registrationFetcher = useFetcher({ key: REGISTRATION_FETCHER_KEY });
  const habits = projectRegistration(loadedHabits, registration);
  const saving = registration?.phase === "saving";
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [checkedHabitIds, setCheckedHabitIds] = useAtom(checkedHabitIdsAtom);
  const [userWeekStartsAtMonday] = useAtom(userWeekStartsAtMondayAtom);
  const [dayStartsAt] = useAtom(userDayStartsAtAtom);
  const isBusy = saving || navigation.state === "submitting";

  function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (store.get(registrationAtom)?.phase === "saving" || !checkedHabitIds.length) return;
    let batch;
    try { batch = createRegistrationBatch(habits, checkedHabitIds); }
    catch { showSnackBar("A selected habit is no longer available. Reload your habit list.", "error"); return; }
    store.set(registrationAtom, { phase: "saving", batch, acknowledged: false });
    setCheckedHabitIds((ids) => ids.filter((id) => !batch.habitIds.includes(id)));
    const data = new FormData();
    data.set("registrationId", batch.id);
    registrationFetcher.submit(data, { method: "post", action: "/?index", preventScrollReset: true });
  }

  function sortHabitsCB(a: Habit, b: Habit) {
    // If progress is not 100, go first
    const progressA = getProgress(a, false, userWeekStartsAtMonday);
    const progressB = getProgress(b, false, userWeekStartsAtMonday);
    if (progressA < 100 && progressB === 100) return -1;
    if (progressA === 100 && progressB < 100) return 1;

    // If no frequency, go by name
    if (!a.frequency || !b.frequency || !a.frequencyUnit || !b.frequencyUnit) {
      return a.name.localeCompare(b.name);
    }

    // Hierarchical sorting. Day -> Week -> Month
    const frequencyUnitMap: Record<FrequencyUnit, number> = {
      day: 1,
      week: 2,
      month: 3,
    };

    // Go by frequency unit
    if (frequencyUnitMap[a.frequencyUnit] < frequencyUnitMap[b.frequencyUnit]) return -1;
    if (frequencyUnitMap[a.frequencyUnit] > frequencyUnitMap[b.frequencyUnit]) return 1;

    // If same frequency unit, go by frequency
    if (b.frequency < a.frequency) return -1;
    if (b.frequency > a.frequency) return 1;

    // If same frequency and unit, go by name
    return a.name.localeCompare(b.name);
  }

  const sortingHabits = saving ? registration.batch.before : habits;
  const order = new Map([...sortingHabits].sort(sortHabitsCB).map((habit, index) => [habit.id, index]));
  const sortedHabits = [...habits].sort((a, b) => (order.get(a.id) ?? Infinity) - (order.get(b.id) ?? Infinity));

  let greeting = "Good ";
  if (dayjs().hour() < 10) greeting += "morning! 🌅";
  else if (dayjs().hour() < 19) greeting += "day! ☀️";
  else greeting += "evening! 🌙";

  const firstCompletedHabitId = [...sortingHabits].sort(sortHabitsCB).find((habit) => {
    const progress = getProgress(habit, false, userWeekStartsAtMonday);
    return progress === 100;
  })?.id;

  const allHabitsCompleted = sortedHabits.every((habit) => {
    const progress = getProgress(habit, false, userWeekStartsAtMonday);
    return progress === 100;
  });

  return (
    <Box sx={{ ...ambientPageSx, pb: 10 }}>
      {/* ── Header ── */}
      <Fade in timeout={160}>
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(160deg, rgba(13, 37, 20, 0.9) 0%, rgba(19, 53, 29, 0.78) 60%, rgba(13, 37, 20, 0.86) 100%)"
                : "linear-gradient(160deg, rgba(227, 243, 224, 0.88) 0%, rgba(207, 235, 204, 0.82) 60%, rgba(224, 242, 225, 0.88) 100%)",
            borderBottom: 1,
            borderColor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.28 : 0.16),
            px: 2.5,
            pt: 3,
            pb: 2.5,
          }}
        >
          <Box sx={{ ...contentLayerSx, mx: "auto", maxWidth: 552 }}>
            <Typography
              variant="caption"
              align="center"
              display="block"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontSize: "0.75rem",
                mb: 0.5,
              }}
            >
              {dayjs().format("dddd, MMMM D")}
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "44px minmax(0, 1fr) 44px", alignItems: "center", gap: 0.5 }}>
              <Box aria-hidden="true" />
              <Typography
                variant="h5"
                component="h1"
                align="center"
                sx={{
                  fontWeight: 700,
                  fontSize: "clamp(1.25rem, 6vw, 1.5rem)",
                  color: (theme) => (theme.palette.mode === "dark" ? "#e8f5e9" : "#1b5e20"),
                }}
              >
                {greeting}
              </Typography>
              <Tooltip title="Settings">
                <IconButton
                  component={Link}
                  to="/profile"
                  aria-label="Settings"
                  disabled={isBusy}
                  sx={{ color: "text.secondary", "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 } }}
                >
                  <SettingsOutlined sx={{ fontSize: 22 }} />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography
              variant="body2"
              align="center"
              sx={{
                color: "text.secondary",
                mt: 0.5,
                fontWeight: 500,
              }}
            >
              {sortedHabits.length > 0
                ? `${sortedHabits.filter((h) => getProgress(h, false, userWeekStartsAtMonday) === 100).length} of ${sortedHabits.length} habits completed`
                : "Start with one small habit."}
            </Typography>
          </Box>
        </Box>
      </Fade>

      {/* ── Content ── */}
      <Box sx={{ ...contentLayerSx, pt: 1.5, px: 1, mx: "auto", maxWidth: 600 }}>
        {refreshFailed && <Alert severity="warning" sx={{ mx: 1, mb: 1.5 }} action={<Button onClick={() => revalidator.revalidate()} disabled={revalidator.state !== "idle"}>Refresh</Button>}>
          Your check-ins are saved, but the list couldn't refresh.
        </Alert>}
        {sortedHabits.length > 0 ? (
          <form onSubmit={handleRegister}>
            {allHabitsCompleted && !saving && (
              <Fade in timeout={160}>
                <Box
                  sx={{
                    ...glassPanelSx,
                    py: 2,
                    px: 2,
                    mx: 1,
                    mb: 2,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: "primary.main" }}>
                    🎉 Congratulations!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You've completed all your habits for now
                  </Typography>
                </Box>
              </Fade>
            )}
            <List disablePadding sx={{ px: 1, pt: 1 }}>
              {sortedHabits.map((habit) => {
                const isChecked = checkedHabitIds.includes(habit.id);
                const isPending = saving && registration.batch.habitIds.includes(habit.id);
                const justSaved = registration?.phase === "saved" && registration.batch.habitIds.includes(habit.id);
                const registeredProgress = getProgress(habit, false, userWeekStartsAtMonday);
                const reachedGoal = justSaved && registeredProgress === 100 && getProgress(registration.batch.before.find((item) => item.id === habit.id) || habit, false, userWeekStartsAtMonday) < 100;
                const previewProgress = getProgress(habit, isChecked, userWeekStartsAtMonday);
                const progressBuffer = getProgressBuffer(habit, dayStartsAt, userWeekStartsAtMonday);
                const progressColor = readableHabitColor(habit.color, theme.palette.background.paper, theme.palette.primary.main, 3);
                const isFirstCompletedHabit = habit.id === firstCompletedHabitId;
                return (
                  <Box key={habit.id} sx={{ mb: 1.5 }}>
                    {isFirstCompletedHabit && (
                      <Divider sx={{ my: 2 }}>
                        <Chip label="Completed" size="small" icon={<Checklist />} color="success" variant="filled" />
                      </Divider>
                    )}{" "}
                    <Box
                      sx={{
                        ...glassPanelSx,
                        borderRadius: "var(--hg-radius)",
                        borderColor: (theme) =>
                          alpha(theme.palette.primary.main, isChecked || isPending ? 0.7 : theme.palette.mode === "dark" ? 0.25 : 0.14),
                        overflow: "visible",
                        transition: "border-color 150ms ease",
                        ...(registeredProgress === 100
                          ? {
                              "& .MuiLinearProgress-root, & .MuiListItemText-root": {
                                filter: "grayscale(100%)",
                              },
                              bgcolor: (theme) =>
                                theme.palette.mode === "dark"
                                  ? alpha(theme.palette.background.default, 0.9)
                                  : alpha(theme.palette.background.default, 0.95),
                            }
                          : {
                              bgcolor: "background.paper",
                            }),
                      }}
                    >
                      <ListItem
                        disablePadding
                        secondaryAction={
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48 }}>
                            <Checkbox
                              disableRipple
                              disabled={navigation.state === "submitting" || isPending}
                              inputProps={{ "aria-label": isPending ? `Saving check-in for ${habit.name}` : `Select ${habit.name} for registration` }}
                              checked={isChecked || isPending}
                              onClick={() =>
                                setCheckedHabitIds((prev) =>
                                  isChecked ? prev.filter((id) => id !== habit.id) : [...prev, habit.id]
                                )
                              }
                              sx={{
                                "& .MuiSvgIcon-root": { fontSize: 32 },
                                color: "text.secondary",
                                "&.Mui-checked": {
                                  color: "primary.main",
                                },
                                "&:hover": { backgroundColor: "transparent" },
                                "&.Mui-focusVisible": {
                                  outline: "2px solid",
                                  outlineColor: "primary.main",
                                  outlineOffset: 2,
                                },
                                padding: 1,
                                borderRadius: "50%",
                                transition: "color 150ms ease",
                              }}
                            />
                          </Box>
                        }
                        sx={{ borderRadius: "inherit", ".MuiListItemButton-root": { borderRadius: "inherit" } }}
                      >
                        <ListItemButton
                          disabled={isBusy}
                          aria-label={`View ${habit.name}, ${Math.round(previewProgress)}% complete${isPending ? ", saving" : isChecked ? ", selected, not saved yet" : ""}`}
                          sx={{
                            py: 1.5,
                            px: 2,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "start",
                            borderRadius: "inherit",
                            position: "relative",
                            overflow: "visible",
                            "&.Mui-disabled": { opacity: 1 },
                            "@media (hover: hover) and (pointer: fine)": {
                              "&:hover": {
                                transform: "none",
                                backgroundColor: "transparent",
                              },
                            },
                          }}
                          onClick={() => navigate(`/${habit.id}`)}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", width: "100%", minWidth: 0 }}>
                            <ListItemAvatar sx={{ color: habit.color, overflow: "visible", zIndex: 10 }}>
                              <Box aria-hidden="true" sx={{ position: "relative", display: "inline-flex", overflow: "visible" }}>
                                <CircularProgress
                                  variant="determinate"
                                  value={previewProgress}
                                  size={56}
                                  thickness={3}
                                  sx={{
                                    color: progressColor,
                                    position: "absolute",
                                    top: -4,
                                    left: -4,
                                    zIndex: 1,
                                  }}
                                />
                                <CircularProgress
                                  variant="determinate"
                                  value={100}
                                  size={56}
                                  thickness={3}
                                  sx={{
                                    color: "action.hover",
                                    position: "absolute",
                                    top: -4,
                                    left: -4,
                                  }}
                                />
                                <Badge
                                  badgeContent={previewProgress === 100 ? <Check sx={{ fontSize: 12 }} /> : null}
                                  color="success"
                                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                  sx={{ "& .MuiBadge-badge": { minWidth: 18, height: 18, p: 0, border: "2px solid", borderColor: "background.paper" } }}
                                >
                                  <Avatar
                                    sx={{
                                      bgcolor: habit.color || "primary.main",
                                      color: (theme) => theme.palette.getContrastText(alphaOrFallback(habit.color, theme.palette.primary.main, 1)),
                                      width: 48,
                                      height: 48,
                                      fontSize: "1.5rem",
                                    }}
                                  >
                                    {iconMap[habit.icon]}
                                  </Avatar>
                                </Badge>
                              </Box>
                            </ListItemAvatar>
                            <ListItemText disableTypography sx={{ minWidth: 0 }}
                              primary={
                                  <Typography
                                    lineHeight={1.35}
                                    sx={{
                                      color: (theme) => readableHabitColor(habit.color, theme.palette.background.paper, theme.palette.text.primary),
                                      fontWeight: 600,
                                      fontSize: "1.0625rem",
                                      overflowWrap: "anywhere",
                                    }}
                                  >
                                    {habit.name}
                                  </Typography>
                              }
                              secondary={
                                <Box component="span" sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mt: 0.5 }}>
                                  <Typography component="span" variant="body2" color="text.secondary">{toFriendlyFrequency(habit)}</Typography>
                                  <HabitNotificationIndicator habit={habit} />
                                  {justSaved && <Typography component="span" sx={{ color: "primary.main", fontSize: "0.75rem", fontWeight: 700 }}>
                                    <Check sx={{ fontSize: 14, verticalAlign: "text-bottom", mr: 0.25 }} />
                                    {reachedGoal ? `${habit.frequencyUnit === "week" ? "Weekly" : habit.frequencyUnit === "month" ? "Monthly" : "Daily"} goal reached` : "Check-in added"}
                                  </Typography>}
                                </Box>
                              }
                            />
                          </Box>
                          <Box sx={{ width: "100%", pr: 1, mt: 1 }}>
                            {habit.frequency && habit.frequencyUnit && (
                              <LinearProgressWithLabel
                                variant="buffer"
                                valueBuffer={progressBuffer}
                                value={previewProgress}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: "action.hover",
                                  ".MuiLinearProgress-bar1Buffer": {
                                    backgroundColor: progressColor,
                                    borderRadius: 3,
                                  },
                                  ".MuiLinearProgress-bar2Buffer": {
                                    backgroundColor: progressColor,
                                    opacity: 0.3,
                                    borderRadius: 3,
                                  },
                                  ".MuiLinearProgress-dashed": {
                                    display: "none",
                                  },
                                }}
                              />
                            )}
                          </Box>
                        </ListItemButton>
                      </ListItem>
                    </Box>
                  </Box>
                );
              })}
            </List>
            <RegisterAction
              habits={habits}
              selected={checkedHabitIds}
              registration={registration}
              disabled={navigation.state === "submitting"}
              onDismissError={() => store.set(registrationAtom, null)}
            />
          </form>
        ) : (
          <Fade in timeout={160}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                px: 3,
                py: 6,
              }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "var(--hg-radius)",
                  bgcolor: "action.hover",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2.5,
                }}
              >
                <Checklist sx={{ fontSize: 36, color: "primary.main" }} />
              </Box>
              <Typography component="h2" variant="h6" color="text.primary" sx={{ mb: 1, fontWeight: 600 }}>
                No habits yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                Choose something small you want to do regularly.
              </Typography>
              <Form action="/new-habit" method="post">
                <Button type="submit" variant="contained" startIcon={<Add />} size="large" loading={navigation.state === "submitting"}>
                  Create your first habit
                </Button>
              </Form>
            </Box>
          </Fade>
        )}
        {sortedHabits.length > 0 && (
          <Box sx={{ mx: 1, mt: 0.5, display: "flex", justifyContent: "flex-end" }}>
            <Form action="/new-habit" method="post">
              <Button
                type="submit"
                variant="outlined"
                aria-label="Add new habit"
                startIcon={<Add />}
                disabled={isBusy}
                loading={navigation.state === "submitting" && navigation.formAction?.endsWith("/new-habit")}
              >
                New habit
              </Button>
            </Form>
          </Box>
        )}
      </Box>

    </Box>
  );
}
