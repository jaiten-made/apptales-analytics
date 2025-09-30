import Paper from "@mui/material/Paper";
import { useParams } from "react-router";
import FlowGraph from "../../components/FlowGraph/FlowGraph";

const UserStoryDetail = () => {
  const { id: storyId, userStoryId } = useParams();

  return (
    <Paper className="h-full">
      <FlowGraph />
    </Paper>
  );
};

export default UserStoryDetail;
