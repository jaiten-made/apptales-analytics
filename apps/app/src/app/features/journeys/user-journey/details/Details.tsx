import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useParams } from "react-router-dom";
import FlowGraph from "../../components/FlowGraph/FlowGraph";

const UserStoryDetails = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Paper className="h-full flex">
      {id ? (
        <FlowGraph projectId={id} />
      ) : (
        <Typography sx={{ p: 2 }}>No ID provided</Typography>
      )}
    </Paper>
  );
};

export default UserStoryDetails;
