export type TeamMember = {
  name: string;
  role: string;
  portrait: string;
  portraitPosition?: string;
};

// Populate with the team's real, approved portraits and details.
export const teamMembers: TeamMember[] = [];
