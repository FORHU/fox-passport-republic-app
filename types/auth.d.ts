declare type TSignUpForm = {
  givenName: string;
  surname: string;
  email: string;
  type: string;
  organization: string;
  sites: string[];
  role: string;
};

declare type TAuthUser = {
  accessToken: string;
  refreshToken: string;
};
