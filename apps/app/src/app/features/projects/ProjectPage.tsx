import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetProjectQuery } from "../../../lib/redux/api/projects/project/project";
import FlowGraph from "../journeys/components/FlowGraph/FlowGraph";

const ProjectPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
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
        gap={2}
      >
        <Button
          startIcon={<IconArrowLeft />}
          onClick={() => navigate("/projects")}
        >
          Back
        </Button>
        <Typography variant="h6" component="h1">
          {project.name}
        </Typography>
      </Box>
      <Box flexGrow={1} overflow="hidden">
        <FlowGraph projectId={projectId} />
      </Box>
    </Box>
  );
};

export default ProjectPage;
