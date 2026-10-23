import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";

const guard = auth.middleware({ loginUrl: "/auth/sign-in" });

export default async function proxy(request: NextRequest) {
  const response = await guard(request);
  if (request.nextUrl.pathname !== "/") {
    return response;
  }

  // The landing page is public: the guard only tells us who is signed in. Signed-in users go straight
  // to Today; everyone else sees the landing page. Either way, keep the cookies the guard set.
  const signedIn = !response.headers.has("location");
  const next = signedIn ? NextResponse.redirect(new URL("/today", request.url)) : NextResponse.next();
  for (const cookie of response.headers.getSetCookie()) {
    next.headers.append("Set-Cookie", cookie);
  }
  return next;
}

export const config = {
  matcher: ["/", "/inbox", "/today", "/tomorrow", "/end-of-week", "/later", "/lists/:path*"],
};
