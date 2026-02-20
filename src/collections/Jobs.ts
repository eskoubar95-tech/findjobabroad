import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'
import { isAdmin, contentUpdateAccess } from './access.js'

export const Jobs: CollectionConfig = {
  slug: 'jobs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'company', 'country', 'status', 'source', 'updatedAt'],
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { position: 'sidebar', readOnly: true, description: 'Immutable after creation' },
    },
    {
      name: 'source',
      type: 'select',
      options: [
        { label: 'Affiliate', value: 'affiliate' },
        { label: 'Manual', value: 'manual' },
      ],
      required: true,
      defaultValue: 'affiliate',
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Expired', value: 'expired' },
      ],
      required: true,
      defaultValue: 'active',
      admin: { position: 'sidebar' },
      // Avoid collision with Payload's _status enum (draft/published)
      enumName: 'enum_jobs_lifecycle_status',
    },
    {
      name: 'affiliateId',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'affiliateSource',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'affiliateUrl',
      type: 'text',
      admin: {
        description:
          'Never rendered directly in HTML — used via /api/jobs/[slug]/apply redirect',
      },
      access: {
        read: (args) => isAdmin(args),
      },
    },
    {
      name: 'company',
      type: 'text',
    },
    {
      name: 'jobType',
      type: 'select',
      options: [
        { label: 'Full-time', value: 'full-time' },
        { label: 'Part-time', value: 'part-time' },
        { label: 'Seasonal', value: 'seasonal' },
      ],
    },
    {
      name: 'category',
      type: 'text',
      admin: { description: 'e.g. IT & Tech, Finance, Marketing' },
    },
    {
      name: 'requiredLanguages',
      type: 'array',
      fields: [
        {
          name: 'language',
          type: 'text',
          admin: { description: 'ISO code e.g. en, da, sv' },
        },
      ],
    },
    {
      name: 'country',
      type: 'relationship',
      relationTo: 'countries',
    },
    {
      name: 'city',
      type: 'relationship',
      relationTo: 'cities',
    },
    {
      name: 'salary',
      type: 'text',
      admin: { description: 'e.g. €45,000–60,000' },
    },
    {
      name: 'postedAt',
      type: 'date',
    },
    {
      name: 'expiresAt',
      type: 'date',
    },
    {
      name: 'lastSeenAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Updated by sync — do not edit manually',
      },
    },
    {
      name: 'manualOverrides',
      type: 'array',
      fields: [
        {
          name: 'fieldName',
          type: 'text',
        },
      ],
      admin: {
        description:
          'Field names listed here will NOT be overwritten by affiliate sync',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
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
