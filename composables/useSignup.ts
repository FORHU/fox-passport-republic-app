export function useSignup() {
  const signupForm = useState("signupForm", () => ({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    rePassword: "",
    dialCode: "",
    phoneNumber: "",
    companyName: "",
    venueName: "",
    postalCode: "",
    countrySelected: "",
    socialLink: "",
    termsPrivacy: false,
  }));

  const lister = useState("lister", () => false);

  return {
    signupForm,
    lister,
  };
}
