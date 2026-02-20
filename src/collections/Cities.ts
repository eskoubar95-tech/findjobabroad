import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'
import { isAdmin, contentUpdateAccess } from './access.js'

const costOfLivingOptions = [
  'low',
  'low-medium',
  'medium',
  'medium-high',
  'high',
] as const

export const Cities: CollectionConfig = {
  slug: 'cities',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'country', 'costOfLiving', 'updatedAt'],
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'country',
      type: 'relationship',
      relationTo: 'countries',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'avgMonthlySalary',
      type: 'text',
    },
    {
      name: 'costOfLiving',
      type: 'select',
      options: costOfLivingOptions.map((v) => ({ label: v, value: v })),
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      editor: lexicalEditor(),
    },
    {
      name: 'seo',
      type: 'group',
      localized: true,
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
  versions: {
    drafts: { autosave: false },
  },
  access: {
    read: () => true,
    create: contentUpdateAccess,
    update: contentUpdateAccess,
    delete: (args) => isAdmin(args),
  },
}
