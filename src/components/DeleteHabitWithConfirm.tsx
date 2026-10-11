import { DeleteOutlined } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef, ReactElement, Ref, useId, useState } from "react";
import { Form, useNavigation } from "react-router-dom";
import { Habit } from "../types/Habit";
import { confirmationActionsSx, confirmationPaperSx } from "../styles/designLanguage";

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
  const titleId = useId();
  const descriptionId = useId();
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
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        TransitionComponent={Transition}
        keepMounted
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: confirmationPaperSx }}
        sx={{ "& .MuiDialog-container": { alignItems: { xs: "flex-end", sm: "center" } } }}
      >
        <Form action={`/${id}/delete`} method="post">
          <DialogTitle id={titleId} sx={{ px: 3, pt: 3, pb: 1, fontSize: "1.5rem", lineHeight: 1.3 }}>
            Delete habit?
          </DialogTitle>
          <DialogContent sx={{ px: 3, pb: 3 }}>
            <DialogContentText id={descriptionId} sx={{ lineHeight: 1.6, overflowWrap: "anywhere" }}>
              <Typography component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                “{habit.name}”
              </Typography>
              {" "}and its history will be removed. You can restore them with Undo after deleting.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={confirmationActionsSx}>
            <Button onClick={handleClose} variant="outlined" sx={{ minHeight: 48 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              color="error"
              loading={navigation.state === "submitting"}
              sx={{ minHeight: 48 }}
            >
              Delete habit
            </Button>
          </DialogActions>
        </Form>
      </Dialog>
    </>
  );
}
