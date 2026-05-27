"use client";
import { useState } from "react";
import Link from "next/link";

export default function HeroSection() {
    const [videoError, setVideoError] = useState(false);

    return (
        <section className="relative w-full min-h-[88vh] flex items-center justify-center overflow-hidden">
            {/* Background Video com fallback para imagem */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {!videoError ? (
                    <video
                        src="/video_saotome.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        onError={() => setVideoError(true)}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <img
                        src="/images/hero-bg.jpg"
                        alt="Vista aérea de São Tomé"
                        className="w-full h-full object-cover scale-105"
                    />
                )}
                <div className="absolute inset-0 hero-gradient" />
            </div>

            {/* Decorative blobs */}
            <div className="absolute top-1/4 left-[-6rem] w-96 h-96 rounded-full bg-primary-500/20 blur-[100px] pointer-events-none z-0" />
            <div className="absolute bottom-1/3 right-[-4rem] w-72 h-72 rounded-full bg-secondary-400/20 blur-[80px] pointer-events-none z-0" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none z-0" />




            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/60 to-transparent z-10 pointer-events-none" />
        </section>
    );
}

