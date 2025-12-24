import {
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
} from "@mui/material";
import { IconCode, IconEdit, IconTrash } from "@tabler/icons-react";

interface ProjectListItemProps {
  project: {
    id: string;
    name: string;
    createdAt: string;
  };
  onEdit: (projectId: string) => void;
  onIntegration: (
    project: { id: string; name: string },
    e: React.MouseEvent
  ) => void;
  onDelete: (projectId: string, e: React.MouseEvent) => void;
  onClick: (projectId: string) => void;
}

const ProjectListItem = ({
  project,
  onEdit,
  onIntegration,
  onDelete,
  onClick,
}: ProjectListItemProps) => {
  return (
    <ListItem
      key={project.id}
      disablePadding
      secondaryAction={
        <Stack direction="row" spacing={0.5}>
          <IconButton
            edge="end"
            aria-label="edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(project.id);
            }}
          >
            <IconEdit />
          </IconButton>
          <IconButton
            edge="end"
            aria-label="integration"
            onClick={(e) => onIntegration(project, e)}
          >
            <IconCode />
          </IconButton>
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={(e) => onDelete(project.id, e)}
            color="error"
          >
            <IconTrash />
          </IconButton>
        </Stack>
      }
    >
      <ListItemButton onClick={() => onClick(project.id)}>
        <ListItemText
          primary={project.name}
          secondary={`Created: ${new Date(project.createdAt).toLocaleDateString()}`}
        />
      </ListItemButton>
    </ListItem>
  );
};

export default ProjectListItem;
