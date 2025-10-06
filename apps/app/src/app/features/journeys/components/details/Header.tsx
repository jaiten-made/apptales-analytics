import { AppBar, Breadcrumbs, Link, Toolbar, Typography } from "@mui/material";
import React from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import theme from "../../../../../lib/mui/theme";
import { actions } from "../../../../../lib/redux/features/journeys/slice";
import { selectSelectedJourney } from "../../../../../lib/redux/features/journeys/slice/selectors";
import { useAppDispatch, useAppSelector } from "../../../../../lib/redux/hook";
import rows from "../DataTable/data.json";

interface HeaderProps {
  rows?: typeof rows;
  onNavigate?: (path: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { id, storyId, userStoryId } = useParams();
  const location = useLocation();
  const { name } = useAppSelector(selectSelectedJourney) ?? {};
  const dispatch = useAppDispatch();

  const navigateTo = React.useMemo(
    () => onNavigate ?? ((path: string) => navigate(path)),
    [onNavigate, navigate]
  );

  const isStoriesRoute = location.pathname === "/journeys";
  const isSelectedStoryRoute =
    Boolean(id) && location.pathname === `/journeys/${id}`;

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
      <Toolbar
        sx={{
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="none"
            color={isStoriesRoute ? "text.primary" : "text.secondary"}
            href="/journeys"
            onClick={(e) => {
              handleNavigate(e, "/journeys");
              dispatch(actions.setSelectedJourney(undefined));
            }}
          >
            User Journeys
          </Link>
          {name && (
            <Link
              underline="none"
              color={isSelectedStoryRoute ? "text.primary" : "text.secondary"}
              href={`/journeys/${storyId}`}
              onClick={(e) => handleNavigate(e, `/journeys/${storyId}`)}
            >
              {name}
            </Link>
          )}
          {userStoryId && (
            <Typography color="text.secondary">User Journeys</Typography>
          )}
          {userStoryId && (
            <Typography color="text.primary">User {userStoryId}</Typography>
          )}
        </Breadcrumbs>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
