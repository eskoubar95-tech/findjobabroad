// Swap point: replace MockJobFeedAdapter with a real adapter when integrating a live affiliate feed.
export { MockJobFeedAdapter } from './mock-adapter.js'
export type { JobFeedAdapter, NormalizedJob } from './types.js'

import { MockJobFeedAdapter } from './mock-adapter.js'

export const jobFeedAdapter = new MockJobFeedAdapter()
