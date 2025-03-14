import { useAPI } from "./useAPI";
import MUser from "~/models/user.model";

export default function useLocalAuth() {
  const config = useRuntimeConfig().public;
  
  const cookieOptions: any = {
    // domain: config.DOMAIN, 
    secure: process.env.NODE_ENV === "production" ? true : false,
    maxAge: 30 * 24 * 60 * 60,
  };

  const USE_V2_ROUTES = config.USE_V2_ROUTES === "true"

  async function login({ email = "", password = "", role = "" }) {
    const version = USE_V2_ROUTES ? `v2` : `v1`
    return await useAPI(`/${version}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    });
  }

  function clearCookies() {
    useCookie("accessToken").value = null;
    useCookie("refreshToken").value = null;
    useCookie("user").value = null;
    useCookie("organization").value = null;
    useCookie("space_page").value = null;
    useCookie("cookie_page").value = null;
    useCookie("mode").value = null;
    useCookie("event_type").value = null;
    useCookie('role-type').value = null;
  }

  async function logout() {
    try {
      await useAPI("/v1/auth/logout", {
        method: "POST",
        body: JSON.stringify({ token: useCookie("refreshToken").value }),
      });
    } catch (error) {
      console.log(error);
    } finally {
      clearCookies();
      navigateTo({ name: "index" });
    }
  }

  async function getCurrentUser() {
    const { data, error } = await useAPI("/api/v1/user/me", {});
    if(error.value){
      return;
    }
    
    const temp = data.value as any;
    return temp ? new MUser(temp.data) : new MUser();

  }

  async function signInWithGoogle() {
    try {
      const { data } = await useAPI("/v1/auth/google", {});
      const temp = data.value as any;
      const googleAuthUrl = temp.data;
      window.location = googleAuthUrl;
    } catch (error) {
      console.log(error);
    }
  }

  const _address = {
    country: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    postalCode: "",
  };

  const currentUser = useState("currentUser", () =>
    JSON.parse(JSON.stringify(new MUser()))
  );

  const email = useCookie("user", cookieOptions).value;
  const accessToken = useCookie("accessToken", cookieOptions).value;
  const refreshToken = useCookie("refreshToken", cookieOptions).value;
  const organization = useCookie("organization", cookieOptions).value;

  const loggedIn = computed(() => !!useCookie("user", cookieOptions).value);

  const { setSnackbar } = useLocal();

  async function signup(form: TSignUpForm) {
    // const { error, data } = await useAPI("/v1/auth/registration", {
    const version = USE_V2_ROUTES ? `v2` : `v1`
    return await useAPI(`/${version}/auth/registration`, {
      method: "POST",
      body: JSON.stringify(form),
    });
    // const res = data.value as TResponse;
    // if (!error.value) {
    //   await setSnackbar({ text: res.message, modal: true });
    //   return;
    // }

    // if (error.value) {
    //   setSnackbar({ text: error.value as any, modal: true });
    //   return;
    // }
  }

  async function inviteUser(form: TSignUpForm) {
    const { error, data } = await useAPI("/api/auth/users/sign-up", {
      method: "POST",
      body: JSON.stringify(form),
    });
    const res = data.value as TResponse;
    if (!error.value) {
      return Promise.resolve(res.message);
    }

    if (error.value) {
      return Promise.reject(error.value as any);
    }
  }

  const profile = useState("profile", () =>
    JSON.parse(JSON.stringify(new MUser()))
  );

  const validProfile = useState("validProfile", () => false);

  async function updateName({
    _id = "",
    givenName = "",
    middleName = "",
    surname = "",
  } = {}) {
    const { data, error } = await useAPI(`/api/auth/users/${_id}/name`, {
      method: "PUT",
      body: JSON.stringify({ givenName, middleName, surname }),
    });

    if (error && error.value && error.value.data) {
      return Promise.reject(error.value.data.message);
    }

    if (!error.value) {
      return data.value;
    }
  }

  async function editUser({
    _id = "",
    first_name = "",
    last_name = "",
    email = "",
    phone_number = "",
    date_of_birth = "",
    profile_picture = "",
  } = {}) {

     // Create an object with only non-empty values
    const body = {
      first_name,
      last_name,
      email,
      phone_number,
      date_of_birth,
      profile_picture,
    };

    // Filter out properties with empty values
    const filteredBody = Object.fromEntries(
      Object.entries(body).filter(([_, value]) => value !== "")
    );

    const { data, error } = await useAPI(`/api/v1/user/${_id}`, {
      method: "PATCH",
      body: JSON.stringify(filteredBody),
    });

    if (error && error.value && error.value.data) {
      return Promise.reject(error.value.data);
    }

    if (!error.value) {
      return data.value;
    }
  }

  const deleteAccount = async () => {
    return await useAPI(`/v1/user`, {
      method: "DELETE",
    });
  };

  async function updateUserPassword({ old_password = "", new_password = "" } = {}) {
    const { data, error } = await useAPI(`/v1/auth/update-password`, {
      method: "PATCH",
      body: JSON.stringify({ old_password, new_password }),
    });

    if (error && error.value && error.value.data) {
      return Promise.reject(error.value.data);
    }

    if (!error.value) {
      return data.value;
    }
  }

  async function updateAddress({ _id = "", address = _address } = {}) {
    const { data, error } = await useAPI(`/api/auth/users/${_id}/address`, {
      method: "PUT",
      body: JSON.stringify(address),
    });

    if (error && error.value && error.value.data) {
      return Promise.reject(error.value.data.message);
    }

    if (!error.value) {
      return data.value;
    }
  }

  async function resetPassword(password: string, token: string) {
    const { data, error } = await useAPI(`/v1/auth/password-reset/${token}`, {
      method: "PATCH",
      body: JSON.stringify({ password }),
    });

    if (error && error.value && error.value.data) {
      return Promise.reject(error.value.data.message);
    }

    if (!error.value) {
      return data.value;
    }
  }

  async function updateEmail({ _id = "", email = "" } = {}) {
    const { data, error } = await useAPI(`/api/auth/users/${_id}/email`, {
      method: "PUT",
      body: JSON.stringify({ email }),
    });

    if (error && error.value && error.value.data) {
      return Promise.reject(error.value.data.message);
    }

    if (!error.value) {
      currentUser.value.email = email;
      useCookie("user", cookieOptions).value = email;
      return data.value;
    }
  }

  async function updatePrimaryPhone({ _id = "", primaryPhone = "" } = {}) {
    const { data, error } = await useAPI(
      `/api/auth/users/${_id}/primary-phone`,
      {
        method: "PUT",
        body: JSON.stringify({ primaryPhone }),
      }
    );

    if (error && error.value && error.value.data) {
      return Promise.reject(error.value.data.message);
    }

    if (!error.value) {
      return data.value;
    }
  }

  async function updateMobilePhone({ _id = "", mobilePhone = "" } = {}) {
    const { data, error } = await useAPI(
      `/api/auth/users/${_id}/mobile-phone`,
      {
        method: "PUT",
        body: JSON.stringify({ mobilePhone }),
      }
    );

    if (error && error.value && error.value.data) {
      return Promise.reject(error.value.data.message);
    }

    if (!error.value) {
      return data.value;
    }
  }

  function setLoggedIn() {
    const email = useCookie("user", cookieOptions).value;
    const accessToken = useCookie("accessToken", cookieOptions).value;
    const refreshToken = useCookie("refreshToken", cookieOptions).value;
    // loggedIn.value = email && accessToken && refreshToken ? true : false;
  }

  async function createSpace(spaceId: String, form: TVenueSpace) {
    return await useAPI(`/v1/space/${spaceId}`, {
      method: "POST",
      body: JSON.stringify(form),
    });
  }

  async function updateSpace(spaceId: String, form: TVenueSpace) {
    return await useAPI(`/v1/space/${spaceId}`, {
      method: "PATCH",
      body: JSON.stringify(form),
    });
  }

  async function forgotPasswordMailSend(email: string) {
    return await useAPI(`/api/v1/auth/account-recovery`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  return {
    login,
    logout,
    getCurrentUser,
    currentUser,
    loggedIn,
    organization,
    email,
    signup,
    profile,
    validProfile,
    updateName,
    editUser,
    deleteAccount,
    updateUserPassword,
    updateAddress,
    updateEmail,
    updatePrimaryPhone,
    updateMobilePhone,
    inviteUser,
    resetPassword,
    cookieOptions,
    setLoggedIn,
    signInWithGoogle,
    createSpace,
    updateSpace,
    forgotPasswordMailSend,
    clearCookies
  };
}
