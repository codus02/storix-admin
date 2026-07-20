import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 로그인 페이지는 항상 접근 가능
  if (pathname === '/') {
    return NextResponse.next()
  }

  // 액세스 토큰 확인 (클라이언트에서 설정한 쿠키 또는 헤더)
  const accessToken = request.cookies.get('accessToken')?.value

  // 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!accessToken) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 경로에 미들웨어 적용:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public 폴더 내 파일들 (이미지, 로고 등)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)',
  ],
}
