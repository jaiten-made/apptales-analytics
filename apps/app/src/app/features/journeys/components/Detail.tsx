import { Box, Typography } from "@mui/material";
import { useParams } from "react-router";

const Detail = () => {
  const { id } = useParams();

  return (
    <Box>
      <Typography variant="h5">Journey {id}</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Detail view for journey <strong>{id}</strong>.
      </Typography>
    </Box>
  );
};

export default Detail;
