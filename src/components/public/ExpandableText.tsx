"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ExpandableTextProps = {
  text: string;
};

export default function ExpandableText({
  text,
}: ExpandableTextProps) {
  const maxLength = 420;

  const preview =
    text.length > maxLength
      ? `${text.slice(0, maxLength).trim()}…`
      : text;

  return (
    <div className="mt-6">
      <p className="whitespace-pre-line text-lg leading-8 text-slate-600">
        {preview}
      </p>

      {text.length > maxLength && (
        <Link
          href="/historique"
          className="mt-5 inline-flex items-center gap-2 text-lg font-extrabold text-[#0b73df] transition hover:text-[#075caf]"
        >
          Lire la suite
          <ArrowRight size={18} />
        </Link>
      )}
    </div>
  );
}