import type { CollectionConfig } from 'payload'

const isAdmin = ({ req }: { req: { user?: unknown } }) =>
  (req.user as { role?: string } | null | undefined)?.role === 'admin'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email' },
  auth: true,
  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Moderator', value: 'moderator' },
      ],
      required: true,
      defaultValue: 'moderator',
    },
  ],
  access: {
    read: (args) => isAdmin(args),
    create: (args) => isAdmin(args),
    update: (args) => isAdmin(args),
    delete: (args) => isAdmin(args),
  },
}
