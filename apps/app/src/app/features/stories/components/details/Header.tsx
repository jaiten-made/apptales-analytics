import {
  AppBar,
  Breadcrumbs,
  Divider,
  Link,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import theme from "../../../../../lib/mui/theme";
import rows from "../DataTable/data.json";

interface HeaderProps {
  rows?: typeof rows;
  onNavigate?: (path: string) => void;
  hideDivider?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  rows: rowsProp,
  onNavigate,
  hideDivider,
}) => {
  const navigate = useNavigate();
  const { id, storyId, userStoryId } = useParams();
  const location = useLocation();

  const rowsData = React.useMemo(() => rowsProp ?? rows, [rowsProp]);
  const navigateTo = React.useMemo(
    () => onNavigate ?? ((path: string) => navigate(path)),
    [onNavigate, navigate]
  );

  const isStoriesRoute = location.pathname === "/stories";

  const selectedName = React.useMemo(
    () =>
      id ? rowsData.find((r) => String(r.id) === String(id))?.name : undefined,
    [id, rowsData]
  );

  const handleNavigate = React.useCallback(
    (e: React.SyntheticEvent, path: string) => {
      e.preventDefault();
      navigateTo(path);
    },
    [navigateTo]
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        borderLeft: 0,
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="none"
            color={isStoriesRoute ? "text.primary" : "text.secondary"}
            href="/stories"
            onClick={(e) => handleNavigate(e, "/stories")}
          >
            Stories
          </Link>
          {selectedName &&
            // When on a nested user-story route we make the story name a link so
            // the breadcrumb can navigate back to the story overview.
            (storyId ? (
              <Link
                underline="none"
                color="text.secondary"
                href={`/stories/${storyId}`}
                onClick={(e) => handleNavigate(e, `/stories/${storyId}`)}
              >
                {selectedName}
              </Link>
            ) : (
              <Typography color="text.primary">{selectedName}</Typography>
            ))}
          {userStoryId && (
            <Typography color="text.secondary">User Stories</Typography>
          )}
          {userStoryId && (
            <Typography color="text.primary">User {userStoryId}</Typography>
          )}
        </Breadcrumbs>
      </Toolbar>
      {!hideDivider && <Divider />}
    </AppBar>
  );
};

export default Header;
