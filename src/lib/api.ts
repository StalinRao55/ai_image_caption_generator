import { AppError } from "@/domain/errors";
import { NextResponse } from "next/server";

export function jsonError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }
  console.error(error);
  return NextResponse.json({ error: "Unexpected server error.", code: "INTERNAL" }, { status: 500 });
}
