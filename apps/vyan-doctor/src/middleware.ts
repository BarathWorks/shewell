export { default } from "next-auth/middleware";
// import type { NextRequest } from 'next/server'
// import { NextResponse } from 'next/server'
export const config = {
  matcher: [ "/appointment", "/edit-profile", "/auth/register/personal-info", "/auth/register/address", "/auth/register/identity-documents", "/auth/register/education", "/auth/register/practice-details", "/auth/register/bank-details", "/dashboard"],
};

 
// export function middleware(request: NextRequest) {
//   const url = request.nextUrl.clone()
//   url.pathname = '/http://localhost:3002/api/google-meet-auth/callback'
//   return NextResponse.rewrite(url)
// }