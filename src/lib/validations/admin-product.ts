import { z } from "zod";

const priceTierSchema = z.object({
  minKg: z.number().int().positive(),
  maxKg: z.number().int().positive().nullable(),
  pricePerKg: z.number().positive(),
});

const productTypeSchema = z.enum([
  "beans",
  "chickpea",
  "lentils",
  "mash",
  "soybean",
  "cowpea",
  "pinto",
  "red_kidney",
  "white_kidney",
  "black_eyed_pea",
  "nabat",
  "sugar",
  "raisin",
  "barley",
  "corn",
  "tea",
  "rice",
  "other",
]);

const originSchema = z.enum([
  "iran",
  "canada",
  "usa",
  "argentina",
  "turkey",
  "russia",
  "ukraine",
  "kazakhstan",
  "china",
  "other",
]);

export const adminProductSchema = z.object({
  productType: productTypeSchema,
  origin: originSchema,
  caliber: z.string().trim().min(1).max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "شناسه محصول باید لاتین و خط‌تیره‌دار باشد."),
  basePrice: z.number().positive().max(1_000_000_000),
  purchasePricePerKg: z.number().min(0).max(1_000_000_000).optional(),
  wastePercent: z.number().min(0).max(100).nullable(),
  moisturePercent: z.number().min(0).max(100).nullable(),
  packaging: z.string().trim().min(2).max(120),
  packageWeightKg: z.number().positive().max(1000),
  moqKg: z.number().positive().max(1_000_000_000),
  stockKg: z.number().nonnegative().max(1_000_000_000),
  imageUrl: z.union([z.literal(""), z.string().url()]).optional(),
  tiers: z
    .array(priceTierSchema)
    .min(1, "حداقل یک پلکان قیمت لازم است.")
    .max(20, "حداکثر ۲۰ پلکان قیمت مجاز است.")
    .superRefine((tiers, context) => {
      for (let index = 0; index < tiers.length; index += 1) {
        const tier = tiers[index];
        if (tier.maxKg !== null && tier.maxKg < tier.minKg) {
          context.addIssue({
            code: "custom",
            path: [index, "maxKg"],
            message: "حداکثر وزن باید از حداقل وزن بیشتر باشد.",
          });
        }

        const nextTier = tiers[index + 1];
        if (!nextTier) continue;

        if (tier.maxKg === null || nextTier.minKg <= tier.maxKg) {
          context.addIssue({
            code: "custom",
            path: [index + 1, "minKg"],
            message: "بازه‌های پلکان نباید هم‌پوشانی داشته باشند و باید مرتب باشند.",
          });
        }
      }

      if (tiers[0]?.minKg > 1) {
        context.addIssue({
          code: "custom",
          path: [0, "minKg"],
          message: "اولین پلکان باید از ۱ کیلوگرم آغاز شود.",
        });
      }
    }),
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;
