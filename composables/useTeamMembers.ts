export const useTeamMembers = () => {
  const searchText = useState("teamMemberSearchText", (): string => "");
  const selectedRoleFilter = useState(
    "teamMemberRoleFilter",
    (): string | null => null
  );

  const getTeamMembers = async (query: GetTeamMembersQuery) => {
    const { data, error } = await useAPI("/v1/organization", {
      query,
    });
    if (data.value) {
      const res = data.value as any;
      return res?.data;
    }
    if (error.value) {
      return Promise.reject(error.value);
    }
  };

  const getAdminTeamMembers = async (query: GetTeamMembersQuery) => {
    const { data, error } = await useAPI("/v1/admin/members", {
      query,
    });
    if (data.value) {
      const res = data.value as any;
      return res?.data;
    }
    if (error.value) {
      return Promise.reject(error.value);
    }
  };

  const deleteTeamMember = async (memberId: string) => {
    const { data, error } = await useAPI(`/v1/organization/${memberId}`, {
      method: "DELETE",
    });

    if (data.value) {
      return data.value;
    }
    if (error.value) {
      return Promise.reject(error.value?.data);
    }
  };

  const deleteAdminTeamMember = async (memberId: string) => {
    const { data, error } = await useAPI(`/v1/admin/member/${memberId}`, {
      method: "DELETE",
    });

    if (data.value) {
      return data.value;
    }
    if (error.value) {
      return Promise.reject(error.value?.data);
    }
  };

  const saveTeamMembers = async (payload: TSaveMember, token: string) => {
    const { data, error } = await useAPI(
      `/v1/organization/accepted-invite/${token}`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    if (data.value) {
      return data.value;
    }
    if (error.value) {
      return Promise.reject(error.value?.data);
    }
  };

  const saveAdminTeamMembers = async (payload: TSaveMember, token: string) => {
    const { data, error } = await useAPI(`/v1/admin/accept/${token}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (data.value) {
      return data.value;
    }
    if (error.value) {
      return Promise.reject(error.value?.data);
    }
  };

  const { country } = useLocal();

  const inviteTeamMember = async (invitation: {
    email: string;
    venues: string[];
    assigned_roles: string[];
  }) => {
    const { data, error } = await useAPI(
      `/v1/organization/team-invite?country=${country || "sg"}`,
      {
        method: "POST",
        body: JSON.stringify(invitation),
      }
    );

    if (data.value) {
      return data.value;
    }
    if (error.value) {
      return Promise.reject(error.value?.data);
    }
  };

  const inviteAdminTeamMember = async (invitation: {
    email: string;
    assigned_roles: number;
  }) => {
    const { data, error } = await useAPI(
      `/v1/admin/invitation?country=${country || "sg"}`,
      {
        method: "POST",
        body: JSON.stringify(invitation),
      }
    );
    if (data.value) {
      return data.value;
    }
    if (error.value) {
      return Promise.reject(error.value?.data);
    }
  };

  const updateTeamMember = async (
    memberId: string,
    updateData: {
      venues: string[];
      assigned_roles: string[];
    }
  ) => {
    const { data, error } = await useAPI(`/v1/organization/${memberId}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });

    if (data.value) {
      return data.value;
    }
    if (error.value) {
      return Promise.reject(error.value?.data);
    }
  };

  const updateAdminTeamMember = async ({
    memberId,
    assigned_roles,
    venues,
  }: {
    memberId: string;
    assigned_roles: number;
    venues: string[];
  }) => {
    const { data, error } = await useAPI(`/v1/admin/member/${memberId}`, {
      method: "PATCH",
      body: JSON.stringify({ assigned_roles, venues }),
    });

    if (data.value) {
      return data.value;
    }

    if (error.value) {
      return Promise.reject(error.value?.data);
    }
  };

  const getVenueDetails = async (status: string) => {
    try {
      return await useAPI("v1/venue/venue-details", {
        method: "GET",
        params: { status },
      });
    } catch (error) {
      console.error("Error fetching venue details:", error);
      throw error;
    }
  };

  const getVenueDetailsForAdmin = async () => {
    try {
      const queryString = "?status=REQUIRES_CONSENT";

      return await useAPI(`v1/venue/venue-details${queryString}`, {
        method: "GET",
      });
    } catch (error) {
      console.error("Error fetching venue details:", error);
      throw error;
    }
  };

  // VENUE LISTER ROLES
  const rolesOptions = [
    {
      label: "Member",
      value: 4,
      description:
        "Can view venue management, inquiries, and team members. Read-only access.",
    },
    {
      label: "Admin",
      value: 2,
      description:
        "Can manage team members, update relevant details for newly created venues and spaces, and respond to inquiries.",
    },
    {
      label: "Venue Owner",
      value: 1,
      description: "Has full authority over all aspect.",
    },
  ];

  // ADMIN ROLES
  const adminRolesOptions = [
    {
      label: "Member",
      value: 3,
      description:
        "Responsible for creating venues and spaces, pending for client consent.",
    },
    {
      label: "Sales",
      value: 2,
      description:
        "Authorized to access and review venue information to support client engagement and sales efforts. Also responsible for updating venue status based on client feedback, whether approved or declined.",
    },
    {
      label: "Admin",
      value: 1,
      description:
        "Holds the authority to update all relevant details for newly created venues and spaces, ensuring accuracy and completeness.",
    },
  ];

  const suspendFunctionTeamMembers = async (
    organization_member_id: string,
    suspensionCondition: string
  ) => {
    const { data, error } = await useAPI(
      `/v1/organization/${organization_member_id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          suspension_time: suspensionCondition,
        }),
      }
    );

    if (data.value) {
      return data.value;
    }
    if (error.value) {
      return Promise.reject(error.value?.data);
    }
  };
  const suspendAdminFunctionTeamMembers = async (
    organization_member_id: string,
    suspensionCondition: string
  ) => {
    const { data, error } = await useAPI(
      `/v1/admin/member/${organization_member_id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          suspension_time: suspensionCondition,
        }),
      }
    );
    if (data.value) {
      console.log(data.value);
      return data.value;
    }
    if (error.value) {
      console.log(error.value);
      return Promise.reject(error.value?.data);
    }
  };

  return {
    searchText,
    selectedRoleFilter,
    getTeamMembers,
    getAdminTeamMembers,
    saveTeamMembers,
    saveAdminTeamMembers,
    inviteTeamMember,
    deleteTeamMember,
    deleteAdminTeamMember,
    updateTeamMember,
    updateAdminTeamMember,
    getVenueDetails,
    getVenueDetailsForAdmin,
    rolesOptions,
    suspendFunctionTeamMembers,
    adminRolesOptions,
    inviteAdminTeamMember,
    suspendAdminFunctionTeamMembers,
  };
};
