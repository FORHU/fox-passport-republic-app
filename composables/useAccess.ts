export const useAccess = () => {

    const { currentUser } = useLocalAuth();
  
    const { assigned_roles, role } = currentUser.value;
  

// refer to useTeamMember.ts composable for role constants
const isVenueMember = assigned_roles && role == 'VENUE_LISTER' && assigned_roles == 4;
const isVenueAdmin = assigned_roles && role == 'VENUE_LISTER' && assigned_roles == 2;

// VENUE_OWNER AND LISTER ASSIGNED AS VENUE OWNER
const isVenueOwner = role == 'VENUE_OWNER' || (assigned_roles && role =='VENUE_LISTER' && assigned_roles == 1)


const isUser = role == 'USER'

// the real owner
const isOWNER = role == 'VENUE_OWNER'


// ADMIN TEAM MEMBERS
const isAdminMember = role == 'ADMIN' && assigned_roles == 3

// ADMIN SALES
const isAdminSales = role == 'ADMIN' && assigned_roles == 2

// ADMIN & ADMIN_ADMIN
const isAdmin = role == 'ADMIN' && (!assigned_roles || assigned_roles == null || assigned_roles == 'NO_ROLES_ASSIGNED' || assigned_roles == 1)


// PART OF ADMIN ORGANIZATION isAdmin, isAdminSales, isAdminMember
const teamAdmin = role == 'ADMIN';

// PART OF VENUE OWNER ROLE isVenueOwner, isVenueAdmin, isVenueMember
const teamLister = role == 'VENUE_OWNER' || role == 'VENUE_LISTER';

return {
    isVenueMember,
    isVenueAdmin,
    isVenueOwner,
    isUser,
    isAdmin,
    isOWNER,
    isAdminMember,
    isAdminSales,
    teamAdmin,
    teamLister
    } 
}

// const isVenueMember = computed(() => {
//     return hasAssignedRoles && role == 'VENUE_LISTER' && assigned_roles.includes('MEMBER');
// })

// const isVenueAdmin = computed(() => {
//     return hasAssignedRoles && role == 'VENUE_LISTER' && assigned_roles.includes('ADMIN');
// })

// VENUE_OWNER AND LISTER ASSIGNED AS VENUE OWNER
// const isVenueOwner = computed(() => {
//     return role == 'VENUE_OWNER' || (hasAssignedRoles && role == 'VENUE_LISTER' && assigned_roles.includes('OWNER'));
// })



// const isAdmin = computed(() => {
//     return role === "ADMIN" && (assigned_roles == null || assigned_roles == 'NO_ROLES_ASSIGNED' || assigned_roles == 'ADMIN');
// });
