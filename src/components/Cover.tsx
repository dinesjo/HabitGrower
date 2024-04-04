import { Box, Paper, SxProps } from "@mui/material";
import { ReactNode } from "react";

export default function Cover({ children, sx }: { children: ReactNode; sx?: SxProps | undefined }) {
  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: "url('/cover.jpg')",
        backgroundSize: "cover",
      }}
    >
      <Paper sx={{ ...sx }}>{children}</Paper>
    </Box>
  );
}
