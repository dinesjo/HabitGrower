import { Button, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText } from "@mui/material";
import { Form, useNavigation } from "react-router-dom";
import { DeleteForever } from "@mui/icons-material";
import { Habit } from "../habitsModel";
import { useState } from "react";

export default function DeleteWithConfirm({ habit, id }: { habit: Habit; id: string }) {
  const navigation = useNavigation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const handleOpen = () => setDeleteDialogOpen(true);
  const handleClose = () => setDeleteDialogOpen(false);

  const deleteAtionPath = `/${id}/delete`;

  return (
    <>
      <Button color="error" variant="text" startIcon={<DeleteForever />} onClick={handleOpen}>
        Delete
      </Button>
      <Dialog open={deleteDialogOpen} onClose={handleClose} aria-labelledby={"delete-confirm-title"}>
        <Form action={deleteAtionPath} method="post">
          <DialogTitle id={"delete-confirm-title"}>Delete habit?</DialogTitle>
          <DialogContent>
            <DialogContentText>"{habit.name}" will be deleted. This action cannot be undone.</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="inherit" disabled={navigation.state === "submitting"}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" color="error" disabled={navigation.state === "submitting"}>
              Delete Forever
            </Button>
          </DialogActions>
        </Form>
      </Dialog>
    </>
  );
}
