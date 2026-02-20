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

export const Countries: CollectionConfig = {
  slug: 'countries',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'costOfLiving', 'updatedAt'],
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
      name: 'flag',
      type: 'text',
      admin: { description: 'Emoji or image URL' },
    },
    {
      name: 'avgMonthlySalary',
      type: 'text',
      admin: { description: 'e.g. €1,400' },
    },
    {
      name: 'costOfLiving',
      type: 'select',
      options: costOfLivingOptions.map((v) => ({ label: v, value: v })),
    },
    {
      name: 'visaType',
      type: 'text',
      admin: { description: 'e.g. D7 / Tech Visa' },
    },
    {
      name: 'topIndustries',
      type: 'text',
      admin: { description: 'e.g. Tech, Tourism, Finance' },
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
