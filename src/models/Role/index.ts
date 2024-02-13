export enum Role {
  Owner = 0,
  Admin = 1,
  Member = 2,
}

export const getRoleName = (role: Role) => {
  switch (role) {
    case Role.Member:
      return 'member'
    case Role.Admin:
      return 'admin'
    case Role.Owner:
      return 'owner'
  }
}
