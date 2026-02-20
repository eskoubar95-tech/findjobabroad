import config from '@payload-config'
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from '@payloadcms/next/routes'

const withSlugParams = (
  handler: (request: Request, args: { params: Promise<{ slug?: string[] }> }) => Promise<Response>,
) => {
  return async (
    request: Request,
    args: { params: Promise<{ payload?: string[] }> },
  ) => {
    const params = await args.params
    return handler(request, {
      params: Promise.resolve({ slug: params.payload ?? [] }),
    })
  }
}

export const GET = withSlugParams(REST_GET(config))
export const POST = withSlugParams(REST_POST(config))
export const DELETE = withSlugParams(REST_DELETE(config))
export const PATCH = withSlugParams(REST_PATCH(config))
export const PUT = withSlugParams(REST_PUT(config))
export const OPTIONS = withSlugParams(REST_OPTIONS(config))
