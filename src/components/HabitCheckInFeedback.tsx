import { Check } from "@mui/icons-material";
import { Box, Collapse, Fade, Typography, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";

export default function HabitCheckInFeedback({ message }: { message: string | null }) {
  const [lastMessage, setLastMessage] = useState(message);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const visible = !!message;

  // Keep the confirmation readable throughout its exit transition.
  useEffect(() => {
    if (message) setLastMessage(message);
  }, [message]);

  return (
    <Collapse in={visible} timeout={reducedMotion ? 0 : { enter: 240, exit: 280 }} unmountOnExit>
      <Box sx={{ pt: 0.5 }}>
        <Fade in={visible} timeout={reducedMotion ? 0 : { enter: 200, exit: 180 }}>
          <Typography component="span" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "primary.main", fontSize: "0.75rem", fontWeight: 700, lineHeight: 1.5 }}>
            <Check sx={{ fontSize: 14, flexShrink: 0 }} />
            {message || lastMessage}
          </Typography>
        </Fade>
      </Box>
    </Collapse>
  );
}
