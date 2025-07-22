import {
  SignupForm,
  SignupErrors,
  LoginForm,
  LoginErrors,
} from "../types/forms";

export function validateSignup(form: SignupForm): SignupErrors {
  const errs: SignupErrors = {};
  if (!form.firstName) errs.firstName = "First name required";
  if (!form.lastName) errs.lastName = "Last name required";
  if (!form.company) errs.company = "Company required";
  if (!form.email) errs.email = "Email required";
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
    errs.email = "Invalid email";
  return errs;
}

export function validateLogin(form: LoginForm): LoginErrors {
  const errs: LoginErrors = {};
  if (!form.email) errs.email = "Email required";
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
    errs.email = "Invalid email";
  return errs;
}
