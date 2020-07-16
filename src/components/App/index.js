import React from "react";
import SignIn from "../Forms/SignIn";
import SignUpStu from "../Forms/SignUp/SignUpStu";
import SignUpFac from "../Forms/SignUp/SignUpFac";
import PasswordForget from "../Forms/PasswordForget";
import PasswordUpdate from "../Forms/PasswordUpdate";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import Landing from "../Landing";
import HomePage from "../Home";
import Destination from "../DestinationPage";
import { withAuthentication } from "../Session";

/*Font Awesome Library*/
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowRight,
  faMinus,
  faPlus,
  faPencilAlt,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import ProfilePage from "../Forms/Profile";
import Classroom from "../classroom";
library.add(faArrowRight, faMinus, faPlus, faPencilAlt, faTrashAlt);

const App = () => (
  <Router>
    <div className="App">
      <Switch>
        <Route path={ROUTES.DESTINATION} exact component={Destination} />
        <Route path={ROUTES.LANDING} component={Landing} />
        <Route path={ROUTES.HOME} component={HomePage} />
        <Route path={ROUTES.SIGN_IN} component={SignIn} />
        <Route path={ROUTES.STU_SIGN_UP} component={SignUpStu} />
        <Route path={ROUTES.FAC_SIGN_UP} component={SignUpFac} />
        <Route path={ROUTES.PASSWORD_FORGET} component={PasswordForget} />
        <Route path={ROUTES.PASSWORD_UPDATE} component={PasswordUpdate} />
        <Route path={ROUTES.PROFILE} component={ProfilePage} />
        <Route path={ROUTES.CLASSROOM} component={Classroom} />
      </Switch>
    </div>
  </Router>
);

export default withAuthentication(App);
