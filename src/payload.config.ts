import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users.js'
import { Media } from './collections/Media.js'
import { Countries } from './collections/Countries.js'
import { Cities } from './collections/Cities.js'
import { Jobs } from './collections/Jobs.js'
import { BlogPosts } from './collections/BlogPosts.js'
import { LandingPages } from './collections/LandingPages.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        sync: {
          Component: '/src/app/(payload)/admin/sync/page#default',
          path: '/sync',
          meta: { title: 'Job Sync' },
        },
      },
    },
  },
  collections: [
    Users,
    Media,
    Countries,
    Cities,
    Jobs,
    BlogPosts,
    LandingPages,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: { media: true },
      bucket: process.env.STORAGE_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.STORAGE_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY || '',
        },
        region: process.env.STORAGE_REGION ?? 'auto',
        ...(process.env.STORAGE_ENDPOINT && {
          endpoint: process.env.STORAGE_ENDPOINT,
        }),
      },
    }),
  ],
  localization: {
    locales: ['en', 'da'],
    defaultLocale: 'en',
    fallback: false,
  },
})
