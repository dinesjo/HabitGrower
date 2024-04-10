import { Button, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText } from "@mui/material";
import { Form, useNavigation } from "react-router-dom";
import { DeleteForever } from "@mui/icons-material";
import { Habit } from "../habitsModel";
import { useState } from "react";

export default function DeleteWithConfirm({ habit, id }: { habit: Habit; id: string }) {
  const navigation = useNavigation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <Button color="error" variant="text" startIcon={<DeleteForever />} onClick={() => setDeleteDialogOpen(true)}>
        Delete
      </Button>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby={"delete-confirm-title"}
      >
        <DialogTitle id={"delete-confirm-title"}>Delete habit?</DialogTitle>
        <DialogContent>
          <DialogContentText>"{habit.name}" will be deleted. This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Form action={`/${id}/delete`} method="post">
            <Button variant="contained" type="submit" color="error" disabled={navigation.state === "submitting"}>
              Delete Forever
            </Button>
          </Form>
        </DialogActions>
      </Dialog>
    </>
  );
}
