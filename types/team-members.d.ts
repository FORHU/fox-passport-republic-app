declare  interface GetTeamMembersQuery {
    page: number;
    limit: number;
    status?: string;
    search?: string;
    assigned_roles?: string;
  }


  declare type TSaveMember = {
      first_name: string;
      last_name: string;
      password: string;
      phone_number: string;
  }


  declare type TTeamMember = {
    assigned_roles: number[] | [];
    invited_user: TUser;
    status: 'ACCEPTED' | 'PENDING',
    _id: string;
    suspension_time?: string;
    all_venues?: boolean;
    is_owner?: boolean;
    venues: Partial<TVenue>[];
  }