import { DeleteForever, DeleteOutlined } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useState } from "react";
import { Form, useNavigation } from "react-router-dom";
import { Habit } from "../types/Habit";

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
      <Dialog open={deleteDialogOpen} onClose={handleClose} aria-labelledby={"delete-confirm-title"}>
        <Form action={`/${id}/delete`} method="post">
          <DialogTitle id={"delete-confirm-title"}>Delete "{habit.name}"?</DialogTitle>
          <DialogContent>
            <DialogContentText>This action cannot be undone.</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="inherit" disabled={navigation.state === "submitting"}>
              Cancel
            </Button>
            <Button
              startIcon={<DeleteForever />}
              variant="contained"
              type="submit"
              color="error"
              disabled={navigation.state === "submitting"}
            >
              Delete
            </Button>
          </DialogActions>
        </Form>
      </Dialog>
    </>
  );
}
