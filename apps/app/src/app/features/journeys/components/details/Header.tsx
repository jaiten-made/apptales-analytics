import { AppBar, Breadcrumbs, Link, Toolbar, Typography } from "@mui/material";
import React from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import theme from "../../../../../lib/mui/theme";
import { actions } from "../../../../../lib/redux/features/journeys/slice";
import { selectSelectedJourney } from "../../../../../lib/redux/features/journeys/slice/selectors";
import { useAppDispatch, useAppSelector } from "../../../../../lib/redux/hook";
import { computeJourneyCompletionPercent } from "../../lib/computeCompletion";
import rows from "../DataTable/data.json";

interface HeaderProps {
  rows?: typeof rows;
}

const Header: React.FC<HeaderProps> = () => {
  const navigate = useNavigate();
  const { id, userId } = useParams();
  const location = useLocation();
  const { name } = useAppSelector(selectSelectedJourney) ?? {};

  const journeyCompletion = React.useMemo(() => {
    if (!id) return undefined;
    return computeJourneyCompletionPercent(id);
  }, [id]);
  const dispatch = useAppDispatch();

  const isStoriesRoute = location.pathname === "/journeys";
  const isSelectedStoryRoute =
    Boolean(id) && location.pathname === `/journeys/${id}`;

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
              e.preventDefault(); // disable page refresh
              navigate("/journeys");
              dispatch(actions.setSelectedJourney(undefined));
            }}
          >
            User Journeys
          </Link>
          {name && (
            <Link
              underline="none"
              color={isSelectedStoryRoute ? "text.primary" : "text.secondary"}
              href={`/journeys/${id}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/journeys/${id}`);
              }}
            >
              {name}
              {typeof journeyCompletion === "number" && (
                <Typography
                  component="span"
                  ml={1}
                  color="text.secondary"
                  fontSize={13}
                >
                  {journeyCompletion}%
                </Typography>
              )}
            </Link>
          )}
          {userId && (
            <Typography color="text.secondary">User Journey</Typography>
          )}
          {userId && (
            <Typography color="text.primary">User {userId}</Typography>
          )}
        </Breadcrumbs>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
