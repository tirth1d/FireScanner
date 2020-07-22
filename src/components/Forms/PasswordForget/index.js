import React, { Component } from "react";
import "../index.css";
import { Link } from "react-router-dom";
import { withFirebase } from "../../Configuration";
import * as ROUTES from "../../../constants/routes";
import Banner from "../FormBanner";
import StuSignUpBanner from "../../../images/stud_banner.png";

const PasswordForgetPage = () => (
  <div>
    <Banner
      banner={StuSignUpBanner}
      alt="FcaulLoginBanner"
      banner_header="Forget Password"
      banner_subheader="Please Enter your Account's Email Id"
    />
    <PasswordForgetForm />
  </div>
);

const INITIAL_STATE = {
  email: "",
  error: null,
};

class PasswordForgetFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event) => {
    const { email } = this.state;

    this.props.firebase
      .doPasswordReset(email)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        console.log("Email Sent!!");
      })
      .catch((error) => {
        this.setState({ error });
      });

    event.preventDefault();
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { email, error } = this.state;

    const isInvalid = email === "";

    return (
      <form onSubmit={this.onSubmit}>
        <div className="flex-group">
          <div className="group">
            <input
              name="email"
              value={this.state.email}
              onChange={this.onChange}
              type="text"
              placeholder="Email Address"
            />
          </div>
        </div>

        <button
          disabled={isInvalid}
          type="submit"
          name="submit"
          className="SubmitBut"
        >
          Reset
        </button>

        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

const PasswordForgetLink = () => (
  <p>
    <Link to={ROUTES.PASSWORD_FORGET}>Forgot Password?</Link>
  </p>
);

export default PasswordForgetPage;

const PasswordForgetForm = withFirebase(PasswordForgetFormBase);

export { PasswordForgetForm, PasswordForgetLink };
