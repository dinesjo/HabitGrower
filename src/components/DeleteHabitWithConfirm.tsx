import { DeleteForever, DeleteOutlined, WarningAmber } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Slide, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef, ReactElement, Ref, useState } from "react";
import { Form, useNavigation } from "react-router-dom";
import { Habit } from "../types/Habit";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function DeleteHabitWithConfirm({ habit, id }: { habit: Habit; id: string }) {
  const navigation = useNavigation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const handleOpen = () => setDeleteDialogOpen(true);
  const handleClose = () => setDeleteDialogOpen(false);

  return (
    <>
      <Button startIcon={<DeleteOutlined />} variant="outlined" color="error" onClick={handleOpen}>
        Delete
      </Button>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleClose}
        aria-labelledby={"delete-confirm-title"}
        TransitionComponent={Transition}
        keepMounted
        fullWidth
        PaperProps={{
          sx: {
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            m: 0,
            maxWidth: "100%",
            borderRadius: "24px 24px 0 0",
            maxHeight: "90vh",
          },
        }}
        sx={{
          "& .MuiBackdrop-root": {
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          },
        }}
      >
        <Form action={`/${id}/delete`} method="post">
          {/* Handle for pulling down */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              pt: 1.5,
              pb: 1,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 4,
                borderRadius: 2,
                bgcolor: "divider",
              }}
            />
          </Box>

          {/* Icon and Title */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pt: 2,
              pb: 1,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "error.light",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
                opacity: 0.9,
              }}
            >
              <WarningAmber sx={{ fontSize: 32, color: "error.contrastText" }} />
            </Box>
            <DialogTitle id={"delete-confirm-title"} sx={{ textAlign: "center", pb: 1, pt: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Delete Habit?
              </Typography>
            </DialogTitle>
          </Box>

          <DialogContent sx={{ px: 3, pb: 2 }}>
            <DialogContentText sx={{ textAlign: "center", fontSize: "1rem" }}>
              Are you sure you want to permanently delete{" "}
              <Typography component="span" sx={{ fontWeight: 600, color: habit.color || "primary.main" }}>
                "{habit.name}"
              </Typography>
              ? This action cannot be undone.
            </DialogContentText>
          </DialogContent>

          <Divider />

          <DialogActions sx={{ flexDirection: "column", gap: 1, p: 2 }}>
            <Button
              startIcon={<DeleteForever />}
              variant="contained"
              type="submit"
              color="error"
              loading={navigation.state === "submitting"}
              loadingPosition="start"
              fullWidth
              size="large"
              sx={{
                borderRadius: 3,
                py: 1.5,
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              Delete Permanently
            </Button>
            <Button
              onClick={handleClose}
              variant="outlined"
              color="inherit"
              fullWidth
              size="large"
              sx={{
                borderRadius: 3,
                py: 1.5,
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Form>
      </Dialog>
    </>
  );
}
