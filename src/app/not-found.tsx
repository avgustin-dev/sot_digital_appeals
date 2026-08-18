import Link from "next/link";
import { cookies } from "next/headers";
import { routes } from "@/lib/routes";
import { shellLangFromCookie, shellNotFound } from "@/lib/langCookie";

export default async function NotFound() {
  const jar = await cookies();
  const copy = shellNotFound(shellLangFromCookie(jar.get("vs-kr-lang")?.value));
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold text-court-muted">{copy.code}</p>
      <h1 className="mt-1 text-xl font-semibold text-court-navy">
        {copy.title}
      </h1>
      <p className="mt-2 max-w-md text-sm text-court-muted">{copy.body}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href={routes.home} className="btn-primary">
          {copy.home}
        </Link>
        <Link href={routes.appointment} className="btn-outline">
          {copy.book}
        </Link>
      </div>
    </div>
  );
}
