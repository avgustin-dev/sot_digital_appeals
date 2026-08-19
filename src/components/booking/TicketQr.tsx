"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ticketQrValue } from "@/lib/ticketUrl";

/**
 * QR талона: ссылка на статус записи (код в query). PIN в QR нет.
 * box-sizing: content-box — иначе Tailwind Preflight обрезает модули SVG.
 */
export function TicketQr({
  code,
  isKy,
}: {
  code: string;
  isKy?: boolean;
}) {
  const [value, setValue] = useState(ticketQrValue(code));

  useEffect(() => {
    setValue(ticketQrValue(code));
  }, [code]);

  return (
    <div className="mx-auto text-center">
      <div className="ticket-qr inline-block bg-white p-2">
        <QRCodeSVG
          value={value}
          size={140}
          level="M"
          marginSize={4}
          bgColor="#ffffff"
          fgColor="#0B1F3A"
          title={code}
          style={{ width: 140, height: 140, display: "block" }}
        />
      </div>
      <div className="mt-1 font-mono text-[10px] font-semibold tracking-wide text-court-navy">
        {code}
      </div>
      <p className="mt-1 max-w-[148px] text-[10px] leading-snug text-slate-500">
        {isKy
          ? "Скан: статус жазылуу. PIN талондо, QR'да жок."
          : "Скан: страница статуса. PIN на талоне, в QR его нет."}
      </p>
    </div>
  );
}
