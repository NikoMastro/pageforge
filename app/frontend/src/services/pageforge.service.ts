import { z } from 'zod';

export const LpJsonSchema = z.object({
  page_name: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'page_name must be lowercase and can only contain a-z, 0-9 and hyphens'
  }),
  schema_version: z.number().int().nonnegative(),
  pageforge_version_hash: z.string().min(1),
  data: z.record(z.any())
});

const pageforgeService = {
  LpJsonSchema
};

export default pageforgeService;
