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
import { selectSelectedStory } from "../../../../../lib/redux/features/stories/slice/selectors";
import { useAppSelector } from "../../../../../lib/redux/hook";
import rows from "../DataTable/data.json";

interface HeaderProps {
  rows?: typeof rows;
  onNavigate?: (path: string) => void;
  hideDivider?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, hideDivider }) => {
  const navigate = useNavigate();
  const { id, storyId, userStoryId } = useParams();
  const location = useLocation();
  const { name } = useAppSelector(selectSelectedStory) ?? {};

  const navigateTo = React.useMemo(
    () => onNavigate ?? ((path: string) => navigate(path)),
    [onNavigate, navigate]
  );

  const isStoriesRoute = location.pathname === "/stories";
  const isSelectedStoryRoute =
    Boolean(id) && location.pathname === `/stories/${id}`;

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
          <Link
            underline="none"
            color={isSelectedStoryRoute ? "text.primary" : "text.secondary"}
            href={`/stories/${storyId}`}
            onClick={(e) => handleNavigate(e, `/stories/${storyId}`)}
          >
            {name}
          </Link>
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
