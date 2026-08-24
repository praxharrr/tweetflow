import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("x_oauth_state")?.value;
  const codeVerifier = cookieStore.get("x_code_verifier")?.value;

  if (!code || !state || state !== savedState || !codeVerifier) {
    return NextResponse.redirect("http://localhost:3000/?error=oauth_failed");
  }

  const basicAuth = Buffer.from(
    `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
  ).toString("base64");

  const tokenRes = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      client_id: process.env.TWITTER_CLIENT_ID!,
      redirect_uri: "http://localhost:3000/api/auth/callback/twitter",
      code_verifier: codeVerifier,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    console.error(tokenData);
    return NextResponse.redirect("http://localhost:3000/?error=token_exchange_failed");
  }

  const { access_token, refresh_token, expires_in } = tokenData;

  const userRes = await fetch("https://api.x.com/2/users/me", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const userData = await userRes.json();

  if (!userRes.ok) {
    console.error(userData);
    return NextResponse.redirect("http://localhost:3000/?error=profile_fetch_failed");
  }

  await prisma.twitterAccount.upsert({
    where: { twitterId: userData.data.id },
    update: {
      username: userData.data.username,
      accessToken: access_token,
      refreshToken: refresh_token ?? null,
      expiresAt: new Date(Date.now() + expires_in * 1000),
    },
    create: {
      twitterId: userData.data.id,
      username: userData.data.username,
      accessToken: access_token,
      refreshToken: refresh_token ?? null,
      expiresAt: new Date(Date.now() + expires_in * 1000),
    },
  });

  cookieStore.delete("x_code_verifier");
  cookieStore.delete("x_oauth_state");

  return NextResponse.redirect("http://localhost:3000/");
}