import React from "react";
import { Link } from "react-router-dom";
import { compose } from "recompose";
import { withAuthorization, withEmailVerification } from "../Session";
import SignOutButton from "../Forms/SignOut";

import { AuthUserContext } from "../Session";

import * as ROUTES from "../../constants/routes";
import * as ROLE from "../../constants/role";

const HomePage = () => (
  <AuthUserContext.Consumer>
    {(authUser) => (
      <div>
        <h1>Home Page</h1>

        {!!authUser.role[ROLE.STUDENT] && (
          <p>The Home Page is accessible by every Students.</p>
        )}
        {!!authUser.role[ROLE.FACULTY] && (
          <p>The Home Page is accessible by every Faculty Members.</p>
        )}

        <PasswordUpdateLink />
        <SignOutButton />
      </div>
    )}
  </AuthUserContext.Consumer>
);

const PasswordUpdateLink = () => (
  <p>
    <Link to={ROUTES.PASSWORD_UPDATE}>Update Password?</Link>
  </p>
);

const condition = (authUser) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition)
)(HomePage);
