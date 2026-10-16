import { Check } from "@mui/icons-material";
import { Box, Fade, Typography, useMediaQuery } from "@mui/material";
import { useEffect, useState, type ReactNode } from "react";

export default function HabitCheckInFeedback({ message, children }: { message: string | null; children: ReactNode }) {
  const [lastMessage, setLastMessage] = useState(message);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const visible = !!message;

  // Keep the confirmation readable throughout its exit transition.
  useEffect(() => {
    if (message) setLastMessage(message);
  }, [message]);

  return (
    <Box sx={{ display: "grid", minWidth: 0 }}>
      <Fade in={!visible} timeout={reducedMotion ? 0 : 120}>
        <Box aria-hidden={visible} sx={{ gridArea: "1 / 1", minWidth: 0 }}>{children}</Box>
      </Fade>
      <Fade in={visible} timeout={reducedMotion ? 0 : 120}>
        <Typography component="span" variant="body2" aria-hidden={!visible} title={message || lastMessage || undefined} sx={{ gridArea: "1 / 1", minWidth: 0, color: "text.secondary", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          <Check sx={{ fontSize: 14, color: "primary.main", verticalAlign: "text-bottom", mr: 0.5 }} />
          {message || lastMessage}
        </Typography>
      </Fade>
    </Box>
  );
}
