// import { authService } from "@/src/server/services/auth.services/auth.service";
// import { handleApiError } from "@/src/lib/bff/handle-api-error";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     // Gọi trực tiếp BE thay vì qua AuthService
//     const response = await authService.logout(body);

//     const nextResponse = NextResponse.json(response, {
//       status: response.,
//     });

//     // Forward cookie từ BE sang client
//     const cookies = response.headers["set-cookie"];
//     if (cookies) {
//       (Array.isArray(cookies) ? cookies : [cookies]).forEach((cookie) => {
//         nextResponse.headers.append("Set-Cookie", cookie);
//       });
//     }

//     return nextResponse;
//   } catch (error) {
//     return handleApiError(error);
//   }
// }
