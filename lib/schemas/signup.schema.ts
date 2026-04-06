import { z } from "zod";

export const signupSchema = z
  .object({
    firstname: z.string().min(1, "Tên không được để trống!"),

    lastname: z.string().min(1, "Họ không được để trống!"),

    email: z
      .string()
      .min(1, "Email không được để trống!")
      .email("Email không hợp lệ!"),

    phone: z
      .string()
      .min(1, "Số điện thoại không được để trống!")
      .regex(/^(03|05|07|08|09)\d{8}$/, {
        message: "Số điện thoại không hợp lệ!",
      }),

    password: z
      .string()
      .min(6, "Mật khẩu phải từ 6 đến 15 ký tự!")
      .max(15, "Mật khẩu phải từ 6 đến 15 ký tự!")
      .refine((value) => !/\s/.test(value), {
        message: "Mật khẩu không được chứa khoảng trắng!",
      }),
    confirmPassword: z
      .string()
      .min(6, "Vui lòng xác nhận mật khẩu!")
      .max(15, "Mật khẩu phải từ 6 đến 15 ký tự!")
      .refine((value) => !/\s/.test(value), {
        message: "Mật khẩu không được chứa khoảng trắng!",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp!",
  });


export type SignupSchema = z.infer<typeof signupSchema>;
