"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface WishlistItem {
  id: string;
  name: string;
  price: string;
  imgSrc?: string;
}

const PLACEHOLDER: WishlistItem[] = [
  { id: "1", name: "Garden Pavilion", price: "₱22,000/night" },
  { id: "2", name: "Neon Nights Template", price: "₱48,500 est." },
  { id: "3", name: "Pro Sound Rig", price: "₱6,000/day" },
  { id: "4", name: "Sarah Reyes Photography", price: "₱8,500/session" },
];

interface Props {
  items?: WishlistItem[];
}

export default function MobileWishlistView({ items = PLACEHOLDER }: Props) {
  const router = useRouter();

  return (
    <div
      style={{
        background: "#050608",
        minHeight: "100svh",
        position: "relative",
        color: "#fff",
      }}
    >
      {/* Nav bar */}
      <div
        style={{
          position: "fixed",
          top: 62,
          left: 0,
          right: 0,
          height: 64,
          zIndex: 5,
          background: "rgba(5,6,8,0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 10,
        }}
      >
        <Image
          src="/foxonlylogo.png"
          alt="FoxPassport"
          width={22}
          height={22}
          style={{ objectFit: "contain" }}
        />
        <button
          onClick={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
            arrow_back
          </span>
        </button>
        <p
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
            margin: 0,
          }}
        >
          Saved
        </p>
      </div>

      {/* 2-column grid */}
      <div
        style={{
          padding: "142px 16px 112px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => router.push(`/wishlist/${item.id}`)}
            style={{
              position: "relative",
              borderRadius: 20,
              overflow: "hidden",
              aspectRatio: "4/5",
              cursor: "pointer",
              border: "none",
              padding: 0,
              display: "block",
              width: "100%",
            }}
          >
            {/* Stripe / image background */}
            {item.imgSrc ? (
              <img
                src={item.imgSrc}
                alt={item.name}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              /> // eslint-disable-line @next/next/no-img-element
            ) : (
              <div
                className="stripe"
                style={{ position: "absolute", inset: 0 }}
              />
            )}

            {/* Gradient overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.72) 35%, transparent 70%)",
              }}
            />

            {/* Heart icon */}
            <span
              className="material-symbols-outlined"
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                fontSize: 20,
                color: "#f472b6",
                fontVariationSettings: "'FILL' 1",
              }}
            >
              favorite
            </span>

            {/* Name + price */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: 12,
                textAlign: "left",
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                  margin: "0 0 3px",
                  lineHeight: 1.2,
                }}
              >
                {item.name}
              </p>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#ccff00",
                  margin: 0,
                }}
              >
                {item.price}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
