import * as migration_20260220_013255_add_t2_collections from './20260220_013255_add_t2_collections';

export const migrations = [
  {
    up: migration_20260220_013255_add_t2_collections.up,
    down: migration_20260220_013255_add_t2_collections.down,
    name: '20260220_013255_add_t2_collections'
  },
];
