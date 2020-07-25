import React, { Component } from "react";
import "../index.css";
import { withFirebase } from "../../Configuration";
import Banner from "../FormBanner";
import StuSignUpBanner from "../../../images/faculty_banner.png";

const PasswordUpdatePage = () => (
  <div>
    <Banner
      banner={StuSignUpBanner}
      alt="FcaulLoginBanner"
      banner_header="Update Password"
      banner_subheader="Please Enter your New Password"
    />
    <PasswordUpdateForm />
  </div>
);

const INITIAL_STATE = {
  passwordOne: "",
  passwordTwo: "",
  error: null,
};

class PasswordUpdateFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event) => {
    const { passwordOne } = this.state;

    this.props.firebase
      .doPasswordUpdate(passwordOne)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        console.log("Password Updated!!");
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
    const { passwordOne, passwordTwo, error } = this.state;

    const isInvalid = passwordOne !== passwordTwo || passwordOne === "";

    return (
      <form onSubmit={this.onSubmit} style={{ paddingBottom: `30px` }}>
        <div className="group">
          <input
            name="passwordOne"
            value={passwordOne}
            onChange={this.onChange}
            type="password"
            className="input"
          />
          <label className="placeholder">New Password</label>
        </div>
        <br />
        <br />
        <div className="group">
          <input
            name="passwordTwo"
            value={passwordTwo}
            onChange={this.onChange}
            type="password"
            className="input"
          />
          <label className="placeholder">Confirm Password</label>
        </div>
        <br />
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
const PasswordUpdateForm = withFirebase(PasswordUpdateFormBase);

export default PasswordUpdatePage;

export { PasswordUpdateForm };
