// import { randomUUID } from "crypto";
// import { readStore, updateStore } from "../lib/jsonStore";
// import {
//   testimonialStoreSchema,
//   testimonialItemSchema,
//   type TestimonialItem,
// } from "../schemas";

// const TESTIMONIAL_STORE_FILE = "testimonials.json";

// export interface CreateTestimonialPayload {
//   name: string;
//   role: string;
//   image: string;
//   rating: number;
//   review: string;
// }

// export interface UpdateTestimonialPayload {
//   name?: string;
//   role?: string;
//   image?: string;
//   rating?: number;
//   review?: string;
// }

// export interface TestimonialListResponse {
//   success: boolean;
//   message: string;
//   list: TestimonialItem[];
//   totalCount: number;
// }

// export interface TestimonialSingleResponse {
//   success: boolean;
//   message: string;
//   data: TestimonialItem;
// }

// async function readTestimonials() {
//   const raw = await readStore(TESTIMONIAL_STORE_FILE);
//   return testimonialStoreSchema.parse(raw);
// }

// export async function getAllTestimonials(): Promise<TestimonialListResponse> {
//   const store = await readTestimonials();
//   return {
//     success: true,
//     message: "Testimonials fetched successfully",
//     list: store.testimonials,
//     totalCount: store.testimonials.length,
//   };
// }

// export async function getTestimonialById(
//   id: string
// ): Promise<TestimonialSingleResponse> {
//   const store = await readTestimonials();
//   const testimonial = store.testimonials.find((item) => item.id === id);

//   if (!testimonial) {
//     return {
//       success: false,
//       message: "Testimonial not found",
//       data: testimonialItemSchema.parse({
//         id,
//         name: "",
//         role: "",
//         image: "",
//         rating: 5,
//         review: "",
//       }),
//     };
//   }

//   return {
//     success: true,
//     message: "Testimonial fetched successfully",
//     data: testimonial,
//   };
// }

// export async function addTestimonial(
//   payload: CreateTestimonialPayload
// ): Promise<TestimonialSingleResponse> {
//   const now = new Date().toISOString();
//   const testimonial = testimonialItemSchema.parse({
//     id: `testimonial-${randomUUID()}`,
//     ...payload,
//     created_at: now,
//     updated_at: now,
//     deleted_at: null,
//   });

//   await updateStore(TESTIMONIAL_STORE_FILE, (current) => {
//     const parsed = testimonialStoreSchema.parse(current);
//     return {
//       testimonials: [...parsed.testimonials, testimonial],
//       meta: {
//         ...parsed.meta,
//         updatedAt: now,
//       },
//     };
//   });

//   return {
//     success: true,
//     message: "Testimonial created successfully",
//     data: testimonial,
//   };
// }

// export async function updateTestimonial(
//   id: string,
//   payload: UpdateTestimonialPayload
// ): Promise<TestimonialSingleResponse> {
//   let updated: TestimonialItem | null = null;

//   await updateStore(TESTIMONIAL_STORE_FILE, (current) => {
//     const parsed = testimonialStoreSchema.parse(current);
//     const testimonials = parsed.testimonials.map((item) => {
//       if (item.id !== id) {
//         return item;
//       }
//       updated = testimonialItemSchema.parse({
//         ...item,
//         ...payload,
//         updated_at: new Date().toISOString(),
//       });
//       return updated;
//     });

//     return {
//       testimonials,
//       meta: {
//         ...parsed.meta,
//         updatedAt: new Date().toISOString(),
//       },
//     };
//   });

//   if (!updated) {
//     throw new Error(`Testimonial not found: ${id}`);
//   }

//   return {
//     success: true,
//     message: "Testimonial updated successfully",
//     data: updated,
//   };
// }

// export async function deleteTestimonial(
//   id: string
// ): Promise<TestimonialSingleResponse> {
//   let removed: TestimonialItem | null = null;

//   await updateStore(TESTIMONIAL_STORE_FILE, (current) => {
//     const parsed = testimonialStoreSchema.parse(current);
//     const testimonials = parsed.testimonials.filter((item) => {
//       if (item.id === id) {
//         removed = item;
//         return false;
//       }
//       return true;
//     });

//     return {
//       testimonials,
//       meta: {
//         ...parsed.meta,
//         updatedAt: new Date().toISOString(),
//       },
//     };
//   });

//   if (!removed) {
//     throw new Error(`Testimonial not found: ${id}`);
//   }

//   return {
//     success: true,
//     message: "Testimonial deleted successfully",
//     data: removed,
//   };
// }
