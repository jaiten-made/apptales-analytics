import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { IconArrowLeft, IconCode } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetProjectQuery } from "../../../lib/redux/api/projects/project/project";
import FlowGraph from "../journeys/components/FlowGraph/FlowGraph";
import ProjectIntegrationModal from "./components/ProjectIntegrationModal";

const ProjectPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);
  const { data: project, isLoading } = useGetProjectQuery(projectId || "", {
    skip: !projectId,
  });

  if (!projectId) {
    return <Typography>No project ID provided</Typography>;
  }

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return <Typography>Project not found</Typography>;
  }

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box
        p={2}
        borderBottom={1}
        borderColor="divider"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="outlined"
            startIcon={<IconArrowLeft />}
            onClick={() => navigate("/projects")}
          >
            Back
          </Button>
          <Typography variant="h6" component="h1">
            {project.name}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<IconCode />}
          onClick={() => setIsIntegrationModalOpen(true)}
        >
          Get Integration Code
        </Button>
      </Box>
      <Box flexGrow={1} overflow="hidden">
        <FlowGraph projectId={projectId} />
      </Box>

      {/* Integration Modal */}
      <ProjectIntegrationModal
        open={isIntegrationModalOpen}
        onClose={() => setIsIntegrationModalOpen(false)}
        projectId={projectId}
        projectName={project.name}
      />
    </Box>
  );
};

export default ProjectPage;
