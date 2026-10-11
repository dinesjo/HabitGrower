import { Add, Check, Checklist } from "@mui/icons-material";
import {
  Avatar,
  AvatarGroup,
  Backdrop,
  Badge,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Fab,
  Fade,
  Grow,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import dayjs from "dayjs";
import { useAtom } from "jotai";
import { Form, redirect, useLoaderData, useNavigate, useNavigation } from "react-router-dom";
import HabitNotificationIndicator from "../../components/HabitNotificationIndicator";
import LinearProgressWithLabel from "../../components/LinearProgressWithLabel";
import { iconMap } from "../../constants/iconMap";
import { fetchAllHabits, registerHabitsNow } from "../../services/habitsPersistance";
import { checkedHabitIdsAtom, store, userDayStartsAtAtom, userWeekStartsAtMondayAtom } from "../../store";
import { FrequencyUnit } from "../../types/FrequencyUnit";
import { Habit } from "../../types/Habit";
import { getProgress, getProgressBuffer, showSnackBar, toFriendlyFrequency } from "../../utils/helpers";
import { ambientPageSx, contentLayerSx, glassPanelSx } from "../../styles/designLanguage";
import { readableHabitColor } from "../../utils/color";

async function loader() {
  return {
    habits: await fetchAllHabits(),
  };
}

// Register habits
async function action({ request }: { request: Request }) {
  // Get IDs from formData and register
  const formData = await request.formData();
  const habitIds = formData.getAll("habitIds") as string[];
  await registerHabitsNow(habitIds);

  // Clear checked habits
  store.set(checkedHabitIdsAtom, []);

  // Show confirmation snackbar
  showSnackBar(`Habit${habitIds.length > 1 ? "s" : ""} registered successfully!`, "success");

  return redirect("/");
}

IndexView.loader = loader;
IndexView.action = action;

export default function IndexView() {
  const { habits } = useLoaderData() as { habits: Habit[] };
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [checkedHabitIds, setCheckedHabitIds] = useAtom(checkedHabitIdsAtom);
  const [userWeekStartsAtMonday] = useAtom(userWeekStartsAtMondayAtom);
  const [dayStartsAt] = useAtom(userDayStartsAtAtom);

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

  const sortedHabits = habits ? habits.sort(sortHabitsCB) : [];

  let greeting = "Good ";
  if (dayjs().hour() < 10) greeting += "morning! 🌅";
  else if (dayjs().hour() < 19) greeting += "day! ☀️";
  else greeting += "evening! 🌙";

  const firstCompletedHabitId = sortedHabits.find((habit) => {
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
          <Box sx={contentLayerSx}>
            <Typography
              variant="caption"
              align="center"
              display="block"
              sx={{
                color: (theme) =>
                  theme.palette.mode === "dark" ? "rgba(144, 198, 91, 0.7)" : "rgba(46, 125, 50, 0.7)",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontSize: "0.75rem",
                mb: 0.5,
              }}
            >
              {dayjs().format("dddd, MMMM D")}
            </Typography>
            <Typography
              variant="h5"
              component="h1"
              align="center"
              sx={{
                fontWeight: 700,
                color: (theme) => (theme.palette.mode === "dark" ? "#e8f5e9" : "#1b5e20"),
              }}
            >
              {greeting}
            </Typography>
            <Typography
              variant="body2"
              align="center"
              sx={{
                color: (theme) =>
                  theme.palette.mode === "dark" ? "rgba(232, 245, 233, 0.55)" : "rgba(27, 94, 32, 0.6)",
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
        {sortedHabits.length > 0 ? (
          <Form method="post" preventScrollReset>
            {allHabitsCompleted && (
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
            <List disablePadding sx={{ px: 1, pt: 1, pb: 10 }}>
              {sortedHabits.map((habit) => {
                const isChecked = checkedHabitIds.includes(habit.id);
                const registeredProgress = getProgress(habit, false, userWeekStartsAtMonday);
                const previewProgress = getProgress(habit, isChecked, userWeekStartsAtMonday);
                const progressBuffer = getProgressBuffer(habit, dayStartsAt, userWeekStartsAtMonday);
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
                          alpha(theme.palette.primary.main, isChecked ? 0.7 : theme.palette.mode === "dark" ? 0.25 : 0.14),
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
                            {isChecked && <input type="hidden" name="habitIds" value={habit.id} />}
                            <Checkbox
                              inputProps={{ "aria-label": `Select ${habit.name} for registration` }}
                              checked={isChecked}
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
                                "@media (hover: hover) and (pointer: fine)": {
                                  "&:hover": {
                                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                  },
                                },
                                "&:active": {
                                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.14),
                                  transition: "all 0.1s ease-out",
                                },
                                "&.Mui-focusVisible": {
                                  outline: "2px solid",
                                  outlineColor: "primary.main",
                                  outlineOffset: 2,
                                },
                                padding: 1,
                                borderRadius: "50%",
                                transition: "color 0.2s ease, background-color 0.2s ease",
                              }}
                            />
                          </Box>
                        }
                        sx={{ borderRadius: "inherit", ".MuiListItemButton-root": { borderRadius: "inherit" } }}
                      >
                        <ListItemButton
                          aria-label={`View ${habit.name}, ${Math.round(previewProgress)}% complete${isChecked ? ", selected, not saved yet" : ""}`}
                          sx={{
                            py: 1.5,
                            px: 2,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "start",
                            borderRadius: "inherit",
                            position: "relative",
                            overflow: "visible",
                            "@media (hover: hover) and (pointer: fine)": {
                              "&:hover": {
                                transform: "none",
                                backgroundColor: "transparent",
                              },
                            },
                          }}
                          onClick={() => navigate(`/${habit.id}`)}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <ListItemAvatar sx={{ color: habit.color, overflow: "visible", zIndex: 10 }}>
                              <Box aria-hidden="true" sx={{ position: "relative", display: "inline-flex", overflow: "visible" }}>
                                <CircularProgress
                                  variant="determinate"
                                  value={previewProgress}
                                  size={56}
                                  thickness={3}
                                  sx={{
                                    color: habit.color || "primary.main",
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
                                      bgcolor: habit.color || "text.primary",
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
                            <ListItemText
                              primary={
                                <Box sx={{ display: "flex", alignItems: "center", pr: 2 }}>
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
                                  <HabitNotificationIndicator sx={{ ml: 1 }} habit={habit} />
                                </Box>
                              }
                              secondary={
                                <Typography component="span" display="block" variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  {toFriendlyFrequency(habit)}
                                </Typography>
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
                                  ".MuiLinearProgress-bar1Buffer": {
                                    backgroundColor: habit.color,
                                    borderRadius: 3,
                                  },
                                  ".MuiLinearProgress-bar2Buffer": {
                                    backgroundColor: habit.color,
                                    opacity: 0.3,
                                    borderRadius: 3,
                                  },
                                  ".MuiLinearProgress-dashed": {
                                    display: "none",
                                  },
                                  ".MuiLinearProgress-root": {
                                    backgroundColor: "rgba(0,0,0,0.08)",
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
            {/* Register FAB */}
            <Box
              sx={{
                position: "fixed",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                bottom: "calc(96px + env(safe-area-inset-bottom, 0px))",
                "@media (display-mode: standalone)": {
                  bottom: "calc(104px + env(safe-area-inset-bottom, 0px))",
                },
                left: 0,
                zIndex: 1000,
                pointerEvents: "none",
              }}
            >
              <Grow in={checkedHabitIds.length > 0} timeout={300}>
                <Fab
                  variant="extended"
                  color="primary"
                  type="submit"
                  aria-label={`Register ${checkedHabitIds.length} ${checkedHabitIds.length === 1 ? "habit" : "habits"}`}
                  disabled={!checkedHabitIds.length || navigation.state === "submitting"}
                  sx={{
                    borderRadius: 999,
                    pointerEvents: "auto",
                    px: 2,
                    height: 58,
                    width: "calc(100% - 48px)",
                    maxWidth: 320,
                    gap: 1,
                    color: "#f7fbf7",
                    background: "linear-gradient(125deg, #285624 0%, #396f2d 55%, #4b7b2f 100%)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    boxShadow: (theme) => theme.palette.mode === "dark"
                      ? "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)"
                      : "0 4px 16px rgba(39,87,32,0.18), inset 0 1px 0 rgba(255,255,255,0.16)",
                    fontSize: "1rem",
                    fontWeight: 700,
                    "@media (hover: hover) and (pointer: fine)": {
                      "&:hover": { background: "linear-gradient(125deg, #2d6028 0%, #3c742e 55%, #4b7b2f 100%)" },
                    },
                    "&.Mui-disabled": { background: "none", borderColor: "transparent" },
                  }}
                >
                  {navigation.state === "submitting" ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: "inherit" }} />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Check sx={{ fontSize: 20 }} />
                      <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                        Register
                        <Box component="span" sx={{ borderRadius: 999, bgcolor: "rgba(0,0,0,0.18)", minWidth: 24, px: 0.5, lineHeight: "24px", fontSize: "0.8rem", fontVariantNumeric: "tabular-nums" }}>
                          {checkedHabitIds.length}
                        </Box>
                      </Box>
                      <AvatarGroup
                        aria-hidden="true"
                        max={4}
                        sx={{
                          minWidth: 84,
                          justifyContent: "flex-start",
                          "& .MuiAvatar-root": { width: 26, height: 26, fontSize: "0.75rem", border: "2px solid #386c2c", color: "#142019" },
                          "& .MuiSvgIcon-root": { fontSize: 16 },
                          "@keyframes habitEnter": { from: { opacity: 0, transform: "translateY(4px) scale(0.85)" }, to: { opacity: 1, transform: "none" } },
                          "@media (prefers-reduced-motion: reduce)": { "& .MuiAvatar-root": { animation: "none" } },
                        }}
                      >
                        {checkedHabitIds.map((id) => {
                          const habit = habits.find((habit) => habit.id === id);
                          return habit ? <Avatar key={id} sx={{ bgcolor: habit.color, animation: "habitEnter 200ms ease-out" }}>{iconMap[habit.icon]}</Avatar> : null;
                        })}
                      </AvatarGroup>
                    </>
                  )}
                </Fab>
              </Grow>
            </Box>
          </Form>
        ) : (
          <Fade in timeout={160}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "60%",
                textAlign: "center",
                px: 4,
                pt: 6,
              }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: (theme) =>
                    theme.palette.mode === "dark"
                      ? "radial-gradient(circle, rgba(144, 198, 91, 0.12) 0%, transparent 70%)"
                      : "radial-gradient(circle, rgba(46, 125, 50, 0.08) 0%, transparent 70%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                }}
              >
                <Checklist sx={{ fontSize: 48, color: "primary.main" }} />
              </Box>
              <Typography variant="h6" color="text.primary" sx={{ mb: 1, fontWeight: 600 }}>
                No habits yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                Choose something small you want to do regularly.
              </Typography>
              <Form action="/new-habit" method="post">
                <Button type="submit" variant="contained" startIcon={<Add />} size="large">
                  Create your first habit
                </Button>
              </Form>
            </Box>
          </Fade>
        )}
      </Box>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: 2000,
          flexDirection: "column",
          gap: 2,
        }}
        open={navigation.state === "submitting"}
      >
        <CircularProgress
          color="primary"
          size={48}
          sx={{
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
            },
          }}
        />
        <Typography variant="h6" color="inherit">
          Registering habits...
        </Typography>
        <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
          Just a moment while we save your progress
        </Typography>
      </Backdrop>
    </Box>
  );
}
