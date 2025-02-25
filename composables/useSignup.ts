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

  const resetSignupForm = () => {
    signupForm.value = {
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
    };
  };

  return {
    signupForm,
    lister,
    resetSignupForm
  };
}
