import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { IconCheck, IconCode, IconCopy, IconX } from "@tabler/icons-react";
import { useState } from "react";

interface ProjectIntegrationModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

const ProjectIntegrationModal = ({
  open,
  onClose,
  projectId,
  projectName,
}: ProjectIntegrationModalProps) => {
  const [copied, setCopied] = useState(false);

  // Generate the script tag - using data-project-id attribute
  const scriptTag = `<script 
  type="module" 
  src="${import.meta.env.VITE_TRACKER_BASE_URL}/tracker.js" 
  data-project-id="${projectId}">
</script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scriptTag);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <IconCode size={24} />
            <Typography variant="h6" component="span">
              Integration Code
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <IconX />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Project Info */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Project
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {projectName}
            </Typography>
          </Box>

          <Divider />

          {/* Installation Instructions */}
          <Box>
            <Typography variant="body2" color="text.secondary">
              Add the below script to your <code>&lt;head&gt;</code> section:
            </Typography>
          </Box>

          {/* Script Tag */}
          <Paper
            variant="outlined"
            sx={{
              position: "relative",
              bgcolor: "grey.900",
              color: "grey.100",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 2,
                py: 1,
                bgcolor: "grey.800",
                borderBottom: 1,
                borderColor: "grey.700",
              }}
            >
              <Typography variant="caption" sx={{ color: "grey.400" }}>
                HTML
              </Typography>
              <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  sx={{
                    color: copied ? "success.main" : "grey.400",
                    "&:hover": {
                      bgcolor: "grey.700",
                    },
                  }}
                >
                  {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                </IconButton>
              </Tooltip>
            </Box>
            <Box
              component="pre"
              sx={{
                p: 2,
                m: 0,
                overflow: "auto",
                fontFamily: "monospace",
                fontSize: "0.875rem",
                lineHeight: 1.6,
              }}
            >
              <code>{scriptTag}</code>
            </Box>
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button
          startIcon={copied ? <IconCheck /> : <IconCopy />}
          onClick={handleCopy}
          color={copied ? "success" : "primary"}
          variant="contained"
        >
          {copied ? "Copied!" : "Copy Script"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectIntegrationModal;
