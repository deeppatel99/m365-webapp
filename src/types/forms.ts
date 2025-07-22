export interface SignupForm {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
}

export interface SignupErrors {
  firstName?: string;
  lastName?: string;
  company?: string;
  email?: string;
}

export interface LoginForm {
  email: string;
}

export interface LoginErrors {
  email?: string;
}
