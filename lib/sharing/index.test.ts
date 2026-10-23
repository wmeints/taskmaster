import { beforeEach, describe, expect, it, vi } from "vitest"

const { pool } = vi.hoisted(() => ({ pool: { query: vi.fn() } }))

vi.mock("server-only", () => ({}))
vi.mock("@/lib/db", () => ({ pool }))

import {
  getSharing,
  inviteToList,
  leaveList,
  removeMember,
  resendInvite,
  respondToInvitation,
  revokeInvite,
} from "./index"

const user = { id: "user-1", email: "Ada@Example.com" }
const websiteId = "11111111-1111-4111-8111-111111111111"
const homeId = "22222222-2222-4222-8222-222222222222"
const inviteId = "33333333-3333-4333-8333-333333333333"

beforeEach(() => {
  vi.clearAllMocks()
  pool.query.mockResolvedValue({ rows: [] })
})

describe("getSharing", () => {
  // Answers the three reads: members of the user's lists, invites they sent and invitations they received.
  function givenData({ members = [], invites = [], invitations = [] }: Record<string, unknown[]>) {
    pool.query.mockImplementation(async (sql: string) => ({
      rows: sql.includes("from list_members") ? members : sql.includes("i.declined_at is null") ? invitations : invites,
    }))
  }

  it("groups the people with access by the user's lists", async () => {
    givenData({
      members: [{ list_id: websiteId, id: "user-2", name: "Mara Kok", email: "mara@example.com" }],
      invites: [
        { list_id: websiteId, id: inviteId, email: "joost@example.com", declined: false },
        { list_id: homeId, id: "invite-2", email: "lies@example.com", declined: true },
      ],
    })

    const sharing = await getSharing(user)

    expect(sharing.lists).toEqual({
      [websiteId]: {
        members: [{ id: "user-2", name: "Mara Kok", email: "mara@example.com" }],
        invites: [{ id: inviteId, email: "joost@example.com", declined: false }],
      },
      [homeId]: { members: [], invites: [{ id: "invite-2", email: "lies@example.com", declined: true }] },
    })
  })

  it("lists the invitations waiting for the user's reply, matched by email", async () => {
    givenData({ invitations: [{ id: inviteId, list_name: "Website relaunch", invited_by: "Mara Kok" }] })

    const sharing = await getSharing(user)

    expect(sharing.invitations).toEqual([{ id: inviteId, listName: "Website relaunch", invitedBy: "Mara Kok" }])
    const [, params] = pool.query.mock.calls.find(([sql]) => sql.includes("i.declined_at is null"))!
    expect(params).toEqual(["ada@example.com"])
  })

  it("only reads who has access to lists the user owns", async () => {
    givenData({})

    await getSharing(user)

    for (const [sql, params] of pool.query.mock.calls.filter(([sql]) => !sql.includes("i.declined_at is null"))) {
      expect(sql).toContain("l.user_id = $1")
      expect(params).toEqual([user.id])
    }
  })
})

describe("inviteToList", () => {
  it("invites the addresses to a list the user owns", async () => {
    pool.query.mockResolvedValue({ rows: [{ invited: 2 }] })

    await expect(inviteToList(user.id, websiteId, ["mara@example.com", "joost@example.com"])).resolves.toBeUndefined()

    const [sql, params] = pool.query.mock.calls[0]
    expect(sql).toContain("insert into list_invites")
    expect(sql).toContain("l.user_id = $1")
    expect(params).toEqual([user.id, websiteId, ["mara@example.com", "joost@example.com"]])
  })

  it("sends an earlier invite again instead of adding a second one", async () => {
    pool.query.mockResolvedValue({ rows: [{ invited: 1 }] })

    await inviteToList(user.id, websiteId, ["joost@example.com"])

    expect(pool.query.mock.calls[0][0]).toMatch(/on conflict \(list_id, email\) do update set sent_at = now\(\), declined_at = null/)
  })

  it("says so when everyone already has access", async () => {
    pool.query.mockResolvedValue({ rows: [{ invited: 0 }] })

    await expect(inviteToList(user.id, websiteId, ["ada@example.com"])).resolves.toEqual({
      error: "Everyone you entered already has access",
    })
    expect(pool.query.mock.calls[0][0]).toContain("list_members")
  })
})

describe("managing access", () => {
  it("sends an invite to one of the user's lists again", async () => {
    await resendInvite(user.id, inviteId)

    const [sql, params] = pool.query.mock.calls[0]
    expect(sql).toMatch(/update list_invites set sent_at = now\(\), declined_at = null/)
    expect(sql).toContain("select id from lists where user_id = $1")
    expect(params).toEqual([user.id, inviteId])
  })

  it("revokes an invite to one of the user's lists", async () => {
    await revokeInvite(user.id, inviteId)

    const [sql, params] = pool.query.mock.calls[0]
    expect(sql).toContain("delete from list_invites")
    expect(sql).toContain("select id from lists where user_id = $1")
    expect(params).toEqual([user.id, inviteId])
  })

  it("removes a member from one of the user's lists", async () => {
    await removeMember(user.id, websiteId, "user-2")

    const [sql, params] = pool.query.mock.calls[0]
    expect(sql).toContain("delete from list_members")
    expect(sql).toContain("select id from lists where user_id = $1")
    expect(params).toEqual([user.id, websiteId, "user-2"])
  })
})

describe("respondToInvitation", () => {
  it("joins the list and uses up the invitation in one statement", async () => {
    await respondToInvitation(user, inviteId, { accept: true })

    expect(pool.query).toHaveBeenCalledOnce()
    const [sql, params] = pool.query.mock.calls[0]
    expect(sql).toContain("delete from list_invites")
    expect(sql).toContain("insert into list_members")
    expect(params).toEqual([user.id, inviteId, "ada@example.com"])
  })

  it("declines, so the owner sees the reply", async () => {
    await respondToInvitation(user, inviteId, { accept: false })

    const [sql, params] = pool.query.mock.calls[0]
    expect(sql).toMatch(/update list_invites set declined_at = now\(\)/)
    expect(params).toEqual([inviteId, "ada@example.com"])
  })
})

describe("leaveList", () => {
  it("gives up the user's access to a shared list", async () => {
    await leaveList(user.id, websiteId)

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("delete from list_members"), [user.id, websiteId])
  })
})
