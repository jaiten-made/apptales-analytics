import { Box, Typography } from "@mui/material";
import { useLoaderData } from "react-router";
import type { Journey } from "../service";

const Detail = () => {
  const journey = useLoaderData() as Journey | null | undefined;

  if (!journey) {
    return (
      <Box>
        <Typography variant="h5">Journey not found</Typography>
      </Box>
    );
  }

  return (
    <Box className="p-2">
      <Typography variant="body1" sx={{ mt: 2 }}>
        Detail view for journey <strong>{journey.id}</strong>.
      </Typography>
    </Box>
  );
};

export default Detail;
