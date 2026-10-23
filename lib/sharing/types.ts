// Someone who joined a list.
export type Member = { id: string; name: string; email: string }

// An invite by email that hasn't been accepted yet; declined when the invitee said no.
export type SentInvite = { id: string; email: string; declined: boolean }

// Who, besides its owner, has or was offered access to a list.
export type ListAccess = { members: Member[]; invites: SentInvite[] }

// An invitation for the signed-in user to join someone else's list.
export type Invitation = { id: string; listName: string; invitedBy: string }

export type Sharing = {
  invitations: Invitation[]
  // By list id, for the lists the user owns that anyone has or was offered access to.
  lists: Record<string, ListAccess>
}
