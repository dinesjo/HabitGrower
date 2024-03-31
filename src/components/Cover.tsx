import { Box, Paper } from "@mui/material";
import React from "react";

type Props = {
  children?: React.ReactNode;
};

export default function Cover({ children }: Props): React.ReactNode {
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
      <Paper elevation={12} sx={{ padding: 2, borderRadius: 2 }}>
        {children}
      </Paper>
    </Box>
  );
}
