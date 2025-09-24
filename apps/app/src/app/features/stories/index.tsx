import { Outlet } from "react-router";
import Header from "./components/details/Header";

const Stories = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default Stories;
