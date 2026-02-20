import type { Access } from 'payload'

const role = (req: { user?: unknown }) =>
  (req.user as { role?: string } | null | undefined)?.role

export const isAdmin = (args: { req: { user?: unknown } }) => role(args.req) === 'admin'

export const isAdminOrModerator = (args: { req: { user?: unknown } }) => {
  const r = role(args.req)
  return r === 'admin' || r === 'moderator'
}

/** Content collections: only admin can publish; moderator can create/update drafts only. */
export const contentUpdateAccess: Access = ({ data, req }) => {
  if (data?._status === 'published') return isAdmin({ req })
  return isAdminOrModerator({ req })
}
