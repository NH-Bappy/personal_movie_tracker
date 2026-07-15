const z = require("zod");

const addToWatchListSchema = z.object({
  movieId: z.string(),
  status: z
    .enum(["PLANNED", "WATCHING", "COMPLETE", "DROPPED"], {
      error: () => {
        message: "status must be one of :  PLANNED ,WATCHING ,COMPLETE ,DROPPED";
      },
    })
    .optional(),
  rating: z.preprocess(
    (val) => (val === "" || val === null ? null : val),
    z.union([
      z.null(),
      z.coerce.number().min(1).max(10)
    ]).optional()
  ),
  notes: z.preprocess(
    (val) => (val === "" || val === null ? null : val),
    z.union([
      z.null(),
      z.string()
    ]).optional()
  ),
});

const updateWatchListSchema = z.object({
  status: z
    .enum(["PLANNED", "WATCHING", "COMPLETE", "DROPPED"], {
      error: () => {
        message: "status must be one of :  PLANNED ,WATCHING ,COMPLETE ,DROPPED";
      },
    })
    .optional(),
  rating: z.preprocess(
    (val) => (val === "" || val === null ? null : val),
    z.union([
      z.null(),
      z.coerce.number().min(1).max(10)
    ]).optional()
  ),
  notes: z.preprocess(
    (val) => (val === "" || val === null ? null : val),
    z.union([
      z.null(),
      z.string()
    ]).optional()
  ),
});

module.exports = { addToWatchListSchema, updateWatchListSchema };