import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import { IconCode, IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    useCreateProjectMutation,
    useDeleteProjectMutation,
    useGetProjectsQuery,
} from "../../../lib/redux/api/projects/project/project";
import ProjectIntegrationModal from "./components/ProjectIntegrationModal";

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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
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
            <ListItem
              key={project.id}
              disablePadding
              secondaryAction={
                <Box>
                  <IconButton
                    edge="end"
                    aria-label="integration"
                    onClick={(e) => handleOpenIntegration(project, e)}
                    sx={{ mr: 1 }}
                  >
                    <IconCode />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/projects/${project.id}`);
                    }}
                    sx={{ mr: 1 }}
                  >
                    <IconEdit />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={(e) => handleDelete(project.id, e)}
                  >
                    <IconTrash />
                  </IconButton>
                </Box>
              }
            >
              <ListItemButton onClick={() => navigate(`/projects/${project.id}`)}>
                <ListItemText
                  primary={project.name}
                  secondary={`Created: ${new Date(project.createdAt).toLocaleDateString()}`}
                />
              </ListItemButton>
            </ListItem>
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
          <Button onClick={handleCreate} variant="contained">
            Create
          </Button>
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
