import {
  Box,
  Button,
  Container,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useDeleteProjectMutation,
  useGetProjectsQuery,
} from "../../../lib/redux/api/projects/project/project";
import CreateProjectDialog from "./components/CreateProjectDialog";
import ProjectIntegrationModal from "./components/ProjectIntegrationModal";
import ProjectListItem from "./components/ProjectListItem";

const ProjectsList = () => {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useGetProjectsQuery();
  const [deleteProject] = useDeleteProjectMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [integrationProject, setIntegrationProject] = useState<{
    id: string;
    name: string;
  } | null>(null);

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

      <Paper variant="outlined">
        <List disablePadding>
          {projects?.map((project, index) => (
            <Box key={project.id}>
              <ProjectListItem
                project={project}
                onEdit={(projectId) => navigate(`/projects/${projectId}`)}
                onIntegration={handleOpenIntegration}
                onDelete={handleDelete}
                onClick={(projectId) => navigate(`/projects/${projectId}`)}
              />
              {index < projects.length - 1 && <Divider />}
            </Box>
          ))}
          {projects?.length === 0 && (
            <ListItem>
              <ListItemText primary="No projects found. Create one to get started!" />
            </ListItem>
          )}
        </List>
      </Paper>

      <CreateProjectDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

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
