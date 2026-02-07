import { Check, Checklist } from "@mui/icons-material";
import {
  Avatar,
  AvatarGroup,
  Backdrop,
  Badge,
  Box,
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
    <Box sx={{ pb: 10 }}>
      {/* ── Header ── */}
      <Fade in timeout={400}>
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(160deg, #071a0e 0%, #0f2b18 60%, #0d2415 100%)"
                : "linear-gradient(160deg, #e8f5e9 0%, #c8e6c9 60%, #e0f2e1 100%)",
            px: 2.5,
            pt: 3,
            pb: 2.5,
          }}
        >
          {/* Dot-grid texture */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: (theme) =>
                theme.palette.mode === "dark"
                  ? "radial-gradient(rgba(144, 198, 91, 0.07) 1px, transparent 1px)"
                  : "radial-gradient(rgba(27, 94, 32, 0.045) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              pointerEvents: "none",
            }}
          />
          {/* Decorative shape */}
          <Box
            sx={{
              position: "absolute",
              top: -30,
              right: -20,
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "radial-gradient(circle, rgba(144, 198, 91, 0.12) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(46, 125, 50, 0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <Box sx={{ position: "relative", zIndex: 1 }}>
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
                fontSize: "0.65rem",
                mb: 0.5,
              }}
            >
              {dayjs().format("dddd, MMMM D")}
            </Typography>
            <Typography
              variant="h5"
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
                : "Have you kept up with your habits lately?"}
            </Typography>
          </Box>
        </Box>
      </Fade>

      {/* ── Content ── */}
      <Box sx={{ pt: 1.5, px: 1, mx: "auto", maxWidth: 800 }}>
        {habits ? (
          <Form method="post">
            {allHabitsCompleted && (
              <Fade in timeout={800}>
                <Box
                  sx={{
                    py: 2,
                    px: 2,
                    mx: 1,
                    mb: 2,
                    background: (theme) =>
                      theme.palette.mode === "dark"
                        ? "linear-gradient(135deg, rgba(144, 198, 91, 0.14) 0%, rgba(76, 175, 80, 0.08) 100%)"
                        : "linear-gradient(135deg, rgba(46, 125, 50, 0.08) 0%, rgba(76, 175, 80, 0.05) 100%)",
                    border: 1,
                    borderColor: (theme) =>
                      theme.palette.mode === "dark" ? "rgba(144, 198, 91, 0.2)" : "rgba(46, 125, 50, 0.15)",
                    borderRadius: 3,
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
            <List disablePadding sx={{ px: 1, pt: 3 }}>
              {sortedHabits.map((habit) => {
                const isChecked = checkedHabitIds.includes(habit.id);
                const progress = getProgress(habit, isChecked, userWeekStartsAtMonday);
                const registeredProgress = getProgress(habit, false, userWeekStartsAtMonday);
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
                        borderRadius: 3,
                        overflow: "visible",
                        border: 1,
                        borderColor: (theme) =>
                          theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                        boxShadow: (theme) =>
                          theme.palette.mode === "dark"
                            ? "0 2px 12px rgba(0,0,0,0.25)"
                            : "0 1px 8px rgba(0,0,0,0.04)",
                        transition: "box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out",
                        "@media (hover: hover) and (pointer: fine)": {
                          "&:hover": {
                            boxShadow: (theme) =>
                              theme.palette.mode === "dark"
                                ? "0 6px 24px rgba(0,0,0,0.35)"
                                : "0 6px 20px rgba(0,0,0,0.08)",
                            transform: "translateY(-2px)",
                          },
                        },
                        ...(registeredProgress === 100
                          ? {
                              "& .MuiLinearProgress-root, & .MuiListItemText-root": {
                                filter: "grayscale(100%)",
                              },
                              opacity: 0.7,
                              bgcolor: "background.default",
                            }
                          : {
                              bgcolor: "background.paper",
                            }),
                      }}
                    >
                      <ListItem
                        disablePadding
                        secondaryAction={
                          <>
                            {isChecked && <input type="hidden" name="habitIds" value={habit.id} />}
                            <Checkbox
                              checked={isChecked}
                              onClick={() =>
                                setCheckedHabitIds((prev) =>
                                  isChecked ? prev.filter((id) => id !== habit.id) : [...prev, habit.id]
                                )
                              }
                              sx={{
                                "& .MuiSvgIcon-root": { fontSize: 32 },
                                color: habit.color,
                                "&.Mui-checked": {
                                  color: habit.color,
                                },
                                "@media (hover: hover) and (pointer: fine)": {
                                  "&:hover": {
                                    backgroundColor: `${habit.color}15`,
                                    transform: "scale(1.1)",
                                  },
                                },
                                "&:active": {
                                  transform: "scale(0.9)",
                                  backgroundColor: `${habit.color}25`,
                                  transition: "all 0.1s ease-out",
                                },
                                padding: 2,
                                borderRadius: 2,
                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                              }}
                            />
                          </>
                        }
                        sx={{ borderRadius: "inherit", ".MuiListItemButton-root": { borderRadius: "inherit" } }}
                      >
                        <ListItemButton
                          sx={{
                            py: 1.5,
                            px: 2,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "start",
                            borderRadius: 3,
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
                              <Box sx={{ position: "relative", display: "inline-flex", overflow: "visible" }}>
                                <CircularProgress
                                  variant="determinate"
                                  value={progress}
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
                                  invisible={progress !== 100}
                                  badgeContent={"Done!"}
                                  color="success"
                                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
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
                                    lineHeight={1.25}
                                    sx={{
                                      color: habit.color,
                                      fontWeight: 500,
                                      fontSize: "1.1rem",
                                    }}
                                  >
                                    {habit.name}
                                  </Typography>
                                  <HabitNotificationIndicator sx={{ ml: 1 }} habit={habit} />
                                </Box>
                              }
                              secondary={
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
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
                                value={progress}
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
                bottom: 88,
                left: 0,
                zIndex: 1000,
              }}
            >
              <Grow in={checkedHabitIds.length > 0} timeout={300}>
                <Fab
                  variant="extended"
                  color="primary"
                  type="submit"
                  disabled={!checkedHabitIds.length || navigation.state === "submitting"}
                  sx={{
                    borderRadius: 4,
                    px: 3,
                    py: 1.5,
                    minWidth: 120,
                    height: 56,
                    fontSize: "1rem",
                    fontWeight: 500,
                    background: "linear-gradient(135deg, #478523 0%, #5a9c2d 50%, #6db13c 100%)",
                    boxShadow: "0 6px 16px rgba(71, 133, 35, 0.3)",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "@media (hover: hover) and (pointer: fine)": {
                      "&:hover": {
                        boxShadow: "0 8px 20px rgba(71, 133, 35, 0.4)",
                        transform: "translateY(-2px) scale(1.02)",
                        background: "linear-gradient(135deg, #5a9c2d 0%, #6db13c 50%, #7ec247 100%)",
                        "&::before": {
                          left: "100%",
                        },
                      },
                    },
                    "&:active": {
                      transform: "scale(0.95)",
                      boxShadow: "0 4px 12px rgba(71, 133, 35, 0.5)",
                      background: "linear-gradient(135deg, #5a9c2d 0%, #6db13c 50%, #7ec247 100%)",
                      transition: "all 0.1s ease-out",
                    },
                    "&.Mui-disabled": {
                      bgcolor: "action.disabledBackground",
                      color: "action.disabled",
                      background: "none",
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: "-100%",
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                      transition: "left 0.6s ease-in-out",
                    },
                  }}
                >
                  {navigation.state === "submitting" ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: "inherit" }} />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Check
                        sx={{
                          mr: 1,
                          transition: "transform 0.2s ease-in-out",
                          "@media (hover: hover) and (pointer: fine)": {
                            ".MuiFab-root:hover &": {
                              transform: "rotate(360deg)",
                            },
                          },
                        }}
                      />
                      Register
                    </>
                  )}
                  <AvatarGroup
                    sx={{
                      ml: 1.5,
                      position: "relative",
                      ".MuiAvatar-root": {
                        width: 24,
                        height: 24,
                        fontSize: "0.75rem",
                        border: "2px solid rgba(255,255,255,0.8)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        opacity: 0,
                        transform: "translateX(100px) scale(0)",
                        "@media (hover: hover) and (pointer: fine)": {
                          "&:hover": {
                            transform: "scale(1.2) rotate(5deg)",
                            zIndex: 10,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                            "&::before": {
                              left: "100%",
                            },
                          },
                        },
                        "&:active": {
                          transform: "scale(1.1)",
                          transition: "transform 0.1s ease-out",
                        },
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          top: -2,
                          left: -2,
                          right: -2,
                          bottom: -2,
                          border: "2px solid currentColor",
                          borderRadius: "50%",
                          opacity: 0,
                          transform: "scale(1)",
                          animation: "avatarPulse 2s infinite",
                        },
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: "-100%",
                          width: "100%",
                          height: "100%",
                          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                          transition: "left 0.5s",
                          borderRadius: "50%",
                        },
                      },
                      ".MuiSvgIcon-root": {
                        fontSize: "1rem",
                      },
                      "@keyframes slideInFromBehind": {
                        "0%": {
                          opacity: 0,
                          transform: "translateX(100px) scale(0)",
                        },
                        "50%": {
                          opacity: 0.8,
                          transform: "translateX(20px) scale(1.1)",
                        },
                        "100%": {
                          opacity: 1,
                          transform: "translateX(0) scale(1)",
                        },
                      },
                      "@keyframes avatarPulse": {
                        "0%": {
                          opacity: 0.7,
                          transform: "scale(1)",
                        },
                        "70%": {
                          opacity: 0,
                          transform: "scale(1.4)",
                        },
                        "100%": {
                          opacity: 0,
                          transform: "scale(1)",
                        },
                      },
                      ".MuiAvatar-root:nth-of-type(1)": {
                        animation: "slideInFromBehind 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.0s both",
                      },
                      ".MuiAvatar-root:nth-of-type(2)": {
                        animation: "slideInFromBehind 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both",
                      },
                      ".MuiAvatar-root:nth-of-type(3)": {
                        animation: "slideInFromBehind 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both",
                      },
                      ".MuiAvatar-root:nth-of-type(4)": {
                        animation: "slideInFromBehind 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both",
                      },
                      ".MuiAvatar-root:nth-of-type(n+5)": {
                        animation: "slideInFromBehind 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both",
                      },
                    }}
                    max={4}
                  >
                    {checkedHabitIds.map((id) => {
                      const habit = habits.find((h) => h.id === id)!;
                      return (
                        <Avatar
                          key={id}
                          sx={{
                            bgcolor: habit.color,
                            background: `linear-gradient(135deg, ${habit.color} 0%, ${habit.color}cc 100%)`,
                          }}
                        >
                          {iconMap[habit.icon]}
                        </Avatar>
                      );
                    })}
                  </AvatarGroup>
                </Fab>
              </Grow>
            </Box>
          </Form>
        ) : (
          <Fade in timeout={600}>
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
                <Check sx={{ fontSize: 48, color: "primary.main", opacity: 0.5 }} />
              </Box>
              <Typography variant="h6" color="text.primary" sx={{ mb: 1, fontWeight: 600 }}>
                No habits yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                Start building better habits by tapping the + button below
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.6 }}>
                Your journey to a better you begins with one small step
              </Typography>
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
