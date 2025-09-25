import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useParams } from "react-router";

const UserStoryDetail = () => {
  const { id: storyId, userStoryId } = useParams();

  return (
    <Paper className="p-4">
      <Typography variant="h6">User Story Detail</Typography>
      <Typography variant="body2">Story ID: {storyId}</Typography>
      <Typography variant="body2">User Story ID: {userStoryId}</Typography>
    </Paper>
  );
};

export default UserStoryDetail;
