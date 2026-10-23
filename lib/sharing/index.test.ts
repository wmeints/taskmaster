import { eq } from "drizzle-orm"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("@/lib/db", () => import("@/lib/db/testing"))

import { db, resetDatabase } from "@/lib/db/testing"
import { listInvites, listMembers, lists } from "@/lib/db/schema"
import { users } from "@/lib/db/schema/users"
import {
  getSharing,
  inviteToList,
  leaveList,
  removeMember,
  resendInvite,
  respondToInvitation,
  revokeInvite,
} from "./index"

// Signs in with mixed case; invitations are stored and matched in lower case.
const ada = { id: "6a0c1c3e-1111-4111-8111-111111111111", name: "Ada Lovelace", email: "Ada@Example.com" }
const mara = { id: "6a0c1c3e-2222-4222-8222-222222222222", name: "Mara Kok", email: "mara@example.com" }

async function givenUsers() {
  await db.insert(users).values([ada, mara])
}

async function givenList(name: string, owner = ada.id) {
  const [{ id }] = await db.insert(lists).values({ userId: owner, name, color: "blue" }).returning({ id: lists.id })
  return id
}

async function givenInvite(listId: string, email: string, { invitedBy = ada.id, declined = false } = {}) {
  const [{ id }] = await db
    .insert(listInvites)
    .values({ listId, email, invitedBy, declinedAt: declined ? new Date() : null })
    .returning({ id: listInvites.id })
  return id
}

async function givenMember(listId: string, userId: string) {
  await db.insert(listMembers).values({ listId, userId })
}

const invitesTo = (listId: string) =>
  db
    .select({ email: listInvites.email, declinedAt: listInvites.declinedAt, sentAt: listInvites.sentAt })
    .from(listInvites)
    .where(eq(listInvites.listId, listId))

const membersOf = async (listId: string) =>
  (await db.select({ userId: listMembers.userId }).from(listMembers).where(eq(listMembers.listId, listId))).map(
    (member) => member.userId,
  )

beforeEach(async () => {
  await resetDatabase()
  await givenUsers()
})

describe("getSharing", () => {
  it("groups the people with access by the user's lists", async () => {
    const websiteId = await givenList("Website relaunch")
    const homeId = await givenList("Home renovation")
    await givenMember(websiteId, mara.id)
    const joostId = await givenInvite(websiteId, "joost@example.com")
    const liesId = await givenInvite(homeId, "lies@example.com", { declined: true })

    const sharing = await getSharing(ada)

    expect(sharing.lists).toEqual({
      [websiteId]: {
        members: [{ id: mara.id, name: "Mara Kok", email: "mara@example.com" }],
        invites: [{ id: joostId, email: "joost@example.com", declined: false }],
      },
      [homeId]: { members: [], invites: [{ id: liesId, email: "lies@example.com", declined: true }] },
    })
  })

  it("only shows who has access to lists the user owns", async () => {
    const marasId = await givenList("Mara's list", mara.id)
    await givenMember(marasId, ada.id)
    await givenInvite(marasId, "joost@example.com", { invitedBy: mara.id })

    expect((await getSharing(ada)).lists).toEqual({})
  })

  it("lists the invitations waiting for the user's reply, matched by email", async () => {
    const marasId = await givenList("Website relaunch", mara.id)
    const inviteId = await givenInvite(marasId, "ada@example.com", { invitedBy: mara.id })
    const declinedListId = await givenList("Declined", mara.id)
    await givenInvite(declinedListId, "ada@example.com", { invitedBy: mara.id, declined: true })
    await givenInvite(await givenList("Not for Ada", mara.id), "joost@example.com", { invitedBy: mara.id })

    const sharing = await getSharing(ada)

    expect(sharing.invitations).toEqual([{ id: inviteId, listName: "Website relaunch", invitedBy: "Mara Kok" }])
  })
})

describe("inviteToList", () => {
  it("invites the addresses to a list the user owns", async () => {
    const websiteId = await givenList("Website relaunch")

    await expect(inviteToList(ada.id, websiteId, ["joost@example.com", "lies@example.com"])).resolves.toBeUndefined()

    expect((await invitesTo(websiteId)).map((invite) => invite.email).sort()).toEqual([
      "joost@example.com",
      "lies@example.com",
    ])
  })

  it("sends an earlier invite again instead of adding a second one", async () => {
    const websiteId = await givenList("Website relaunch")
    await givenInvite(websiteId, "joost@example.com", { declined: true })
    const [before] = await invitesTo(websiteId)

    await inviteToList(ada.id, websiteId, ["joost@example.com"])

    const after = await invitesTo(websiteId)
    expect(after).toHaveLength(1)
    expect(after[0].declinedAt).toBeNull()
    expect(after[0].sentAt.getTime()).toBeGreaterThan(before.sentAt.getTime())
  })

  it("skips the owner and the people who already joined, and says so when that's everyone", async () => {
    const websiteId = await givenList("Website relaunch")
    await givenMember(websiteId, mara.id)

    await expect(inviteToList(ada.id, websiteId, ["ada@example.com", "mara@example.com"])).resolves.toEqual({
      error: "Everyone you entered already has access",
    })
    expect(await invitesTo(websiteId)).toEqual([])
  })

  it("does not invite anyone to a list the user doesn't own", async () => {
    const marasId = await givenList("Mara's list", mara.id)

    await expect(inviteToList(ada.id, marasId, ["joost@example.com"])).resolves.toEqual({
      error: "Everyone you entered already has access",
    })
    expect(await invitesTo(marasId)).toEqual([])
  })
})

describe("managing access", () => {
  it("sends an invite to one of the user's lists again, also when it was declined", async () => {
    const websiteId = await givenList("Website relaunch")
    const inviteId = await givenInvite(websiteId, "joost@example.com", { declined: true })

    await resendInvite(ada.id, inviteId)

    expect((await invitesTo(websiteId))[0].declinedAt).toBeNull()
  })

  it("revokes an invite to one of the user's lists", async () => {
    const websiteId = await givenList("Website relaunch")
    const inviteId = await givenInvite(websiteId, "joost@example.com")

    await revokeInvite(ada.id, inviteId)

    expect(await invitesTo(websiteId)).toEqual([])
  })

  it("removes a member from one of the user's lists", async () => {
    const websiteId = await givenList("Website relaunch")
    await givenMember(websiteId, mara.id)

    await removeMember(ada.id, websiteId, mara.id)

    expect(await membersOf(websiteId)).toEqual([])
  })

  it("leaves invites and members of other people's lists alone", async () => {
    const marasId = await givenList("Mara's list", mara.id)
    await givenMember(marasId, ada.id)
    const inviteId = await givenInvite(marasId, "joost@example.com", { invitedBy: mara.id, declined: true })

    await resendInvite(ada.id, inviteId)
    await removeMember(ada.id, marasId, ada.id)
    await revokeInvite(ada.id, inviteId)

    expect(await invitesTo(marasId)).toEqual([expect.objectContaining({ declinedAt: expect.any(Date) })])
    expect(await membersOf(marasId)).toEqual([ada.id])
  })
})

describe("respondToInvitation", () => {
  it("joins the list and uses up the invitation", async () => {
    const marasId = await givenList("Mara's list", mara.id)
    const inviteId = await givenInvite(marasId, "ada@example.com", { invitedBy: mara.id })

    await respondToInvitation(ada, inviteId, { accept: true })

    expect(await membersOf(marasId)).toEqual([ada.id])
    expect(await invitesTo(marasId)).toEqual([])
  })

  it("declines, so the owner sees the reply", async () => {
    const marasId = await givenList("Mara's list", mara.id)
    const inviteId = await givenInvite(marasId, "ada@example.com", { invitedBy: mara.id })

    await respondToInvitation(ada, inviteId, { accept: false })

    expect(await membersOf(marasId)).toEqual([])
    expect(await invitesTo(marasId)).toEqual([expect.objectContaining({ declinedAt: expect.any(Date) })])
  })

  it("ignores invitations sent to someone else", async () => {
    const marasId = await givenList("Mara's list", mara.id)
    const inviteId = await givenInvite(marasId, "joost@example.com", { invitedBy: mara.id })

    await respondToInvitation(ada, inviteId, { accept: true })
    await respondToInvitation(ada, inviteId, { accept: false })

    expect(await membersOf(marasId)).toEqual([])
    expect(await invitesTo(marasId)).toEqual([expect.objectContaining({ declinedAt: null })])
  })
})

describe("leaveList", () => {
  it("gives up the user's access to a shared list", async () => {
    const marasId = await givenList("Mara's list", mara.id)
    await givenMember(marasId, ada.id)

    await leaveList(ada.id, marasId)

    expect(await membersOf(marasId)).toEqual([])
  })
})
