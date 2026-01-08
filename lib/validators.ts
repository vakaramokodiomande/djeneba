import { z } from "zod";

export const orderSchema = z.object({
  listingId: z.string().min(1, "L'ID de l'annonce est requis"),
  quantity: z.number().positive("La quantité doit être positive"),
  deliveryAddress: z.string().optional(),
  buyerNote: z.string().max(500, "La note ne peut pas dépasser 500 caractères").optional(),
  paymentMethod: z.enum(["cash", "wave", "orange_money", "moov_money"]).optional(),
});

export const assignTransporterSchema = z.object({
  transporterId: z.string().min(1, "L'ID du transporteur est requis"),
  transportPrice: z.number().nonnegative("Le prix du transport doit être positif").optional(),
  estimatedDeliveryDate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const parsed = Date.parse(val);
      return !Number.isNaN(parsed);
    }, "Date de livraison estimée invalide"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  role: z.enum(["producteur", "acheteur", "transporteur"], {
    errorMap: () => ({ message: "Le rôle doit être 'producteur', 'acheteur' ou 'transporteur'" }),
  }),
  phone: z.string().optional(),
  location: z.string().optional(),

  companyName: z.string().optional(),
  vehicleType: z.enum(["camion_leger", "camion_moyen", "camion_lourd", "semi_remorque"]).optional(),
  vehicleCapacity: z.number().optional(),
  vehiclePlate: z.string().optional(),
  coverageZones: z.array(z.string()).optional(),
  pricePerKm: z.number().optional(),
  pricePerTon: z.number().optional(),
  basePrice: z.number().optional(),
});
