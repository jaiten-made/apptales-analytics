import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useCreateProjectMutation } from "../../../../lib/redux/api/projects/project/project";

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreateProjectDialog = ({ open, onClose }: CreateProjectDialogProps) => {
  const [createProject] = useCreateProjectMutation();
  const [projectName, setProjectName] = useState("");

  const handleCreate = async () => {
    if (!projectName.trim()) return;
    try {
      await createProject({ name: projectName }).unwrap();
      setProjectName("");
      onClose();
    } catch (error) {
      console.error("Failed to create project", error);
    }
  };

  const handleClose = () => {
    setProjectName("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create New Project</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Project Name"
          fullWidth
          variant="outlined"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleCreate} variant="contained">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProjectDialog;
