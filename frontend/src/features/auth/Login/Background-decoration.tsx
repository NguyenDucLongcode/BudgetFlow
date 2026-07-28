"use client";

export default function BackgroundDecoration() {
  return (
    <>
      {/* Background decoration */}
      <div
        className="
        absolute
        -top-32
        -right-32
        w-96
        h-96
        rounded-full
        bg-indigo-300/30
        blur-3xl
        "
      />

      <div
        className="
        absolute
        -bottom-32
        -left-32
        w-96
        h-96
        rounded-full
        bg-emerald-300/20
        blur-3xl
        "
      />
    </>
  );
}
