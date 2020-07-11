import React from "react";
import Home from "../Home";
import Landing from "../Landing";
import { AuthUserContext } from "../Session";

const Destination = () => (
  <AuthUserContext.Consumer>
    {(authUser) => (authUser ? <NavigationAuth /> : <NavigationNonAuth />)}
  </AuthUserContext.Consumer>
);

const NavigationAuth = () => <Home />;

const NavigationNonAuth = () => <Landing />;

export default Destination;
