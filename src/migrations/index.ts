import * as migration_20261018_104203_initial from './20261018_104203_initial';
import * as migration_20261018_115136_blob_storage_fields from './20261018_115136_blob_storage_fields';
import * as migration_20261018_122138_program_fields from './20261018_122138_program_fields';
import * as migration_20261018_123355_vice_president from './20261018_123355_vice_president';

export const migrations = [
  {
    up: migration_20261018_104203_initial.up,
    down: migration_20261018_104203_initial.down,
    name: '20261018_104203_initial',
  },
  {
    up: migration_20261018_115136_blob_storage_fields.up,
    down: migration_20261018_115136_blob_storage_fields.down,
    name: '20261018_115136_blob_storage_fields',
  },
  {
    up: migration_20261018_122138_program_fields.up,
    down: migration_20261018_122138_program_fields.down,
    name: '20261018_122138_program_fields',
  },
  {
    up: migration_20261018_123355_vice_president.up,
    down: migration_20261018_123355_vice_president.down,
    name: '20261018_123355_vice_president'
  },
];
