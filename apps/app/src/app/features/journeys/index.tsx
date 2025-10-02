import { Outlet } from "react-router";
import Header from "./components/details/Header";

const Journeys = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default Journeys;
