import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectsQuery,
} from "../../../lib/redux/api/projects/project/project";
import ProjectIntegrationModal from "./components/ProjectIntegrationModal";
import ProjectListItem from "./components/ProjectListItem";

const ProjectsList = () => {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useGetProjectsQuery();
  const [createProject] = useCreateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [integrationProject, setIntegrationProject] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleCreate = async () => {
    if (!newProjectName.trim()) return;
    try {
      await createProject({ name: newProjectName }).unwrap();
      setIsCreateOpen(false);
      setNewProjectName("");
    } catch (error) {
      console.error("Failed to create project", error);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(id).unwrap();
      } catch (error) {
        console.error("Failed to delete project", error);
      }
    }
  };

  const handleOpenIntegration = (
    project: { id: string; name: string },
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setIntegrationProject(project);
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading projects...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" component="h1">
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<IconPlus />}
          onClick={() => setIsCreateOpen(true)}
        >
          New Project
        </Button>
      </Box>

      <Paper elevation={1}>
        <List>
          {projects?.map((project) => (
            <ProjectListItem
              key={project.id}
              project={project}
              onEdit={(projectId) => navigate(`/projects/${projectId}`)}
              onIntegration={handleOpenIntegration}
              onDelete={handleDelete}
              onClick={(projectId) => navigate(`/projects/${projectId}`)}
            />
          ))}
          {projects?.length === 0 && (
            <ListItem>
              <ListItemText primary="No projects found. Create one to get started!" />
            </ListItem>
          )}
        </List>
      </Paper>

      <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            variant="outlined"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Integration Modal */}
      {integrationProject && (
        <ProjectIntegrationModal
          open={!!integrationProject}
          onClose={() => setIntegrationProject(null)}
          projectId={integrationProject.id}
          projectName={integrationProject.name}
        />
      )}
    </Container>
  );
};

export default ProjectsList;
