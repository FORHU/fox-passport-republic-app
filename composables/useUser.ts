import { useAPI } from "./useAPI";
import MUser from "~/models/user.model";

export default function useUser() {
  const user = useState("user", () => new MUser());
  const users = useState("users", (): TUser[] => []);
  const page = useState("userPage", () => 1);
  const pages = useState("userPages", () => 1);
  const search = useState("userSearch", () => "");
  const pageRange = useState("userPageRange", () => "-- - -- of --");
  const isUsersLoaded = useState("isUsersLoaded", () => false);

  async function getUserById(id: string) {
    const { data, error } = await useAPI(`/api/auth/users/id/${id}`, {
      method: "GET",
    });
    if (error.value && error.value.data) {
      return Promise.reject(error.value.data.message);
    }

    if (data.value) {
      return Promise.resolve(data.value);
    }
  }

  function setUser(data?: TUser) {
    user.value = new MUser(data);
  }

  const isInviteValid = useState("isInviteValid", () => false);

  async function getUsersByPageSearch(
    { page = 1, search = "" } = {} as { page?: number; search?: string },
  ) {
    const { error, data } = await useAPI("/api/auth/users/", {
      method: "GET",
      query: { page, search },
    });

    if (error && error.value && error.value.data) {
      return Promise.reject(error.value.data.message);
    }

    if (data.value) {
      return Promise.resolve(data.value);
    }
  }

  async function setUsers() {
    try {
      isUsersLoaded.value = false;
      const _users = (await getUsersByPageSearch({
        page: page.value,
        search: search.value,
      })) as TGetUsersByPageSearchResponse;
      users.value = _users.items as TUser[];
      pageRange.value = _users.pageRange;
      pages.value = _users.pages;
      isUsersLoaded.value = true;
    } catch (error) {
      isUsersLoaded.value = true;
    }
  }

  return {
    user,
    users,
    page,
    pageRange,
    setUser,
    isUsersLoaded,
    isInviteValid,
    setUsers,
    getUserById,
  };
}
