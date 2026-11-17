"use client";
import { useState } from "react";
import { Play, X, Film } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function VideoHero() {
    const [isOpen, setIsOpen] = useState(false);
    const [videoError, setVideoError] = useState(false);

    const videoSrc = "/video_saotome.mp4";

    return (
        <section className="relative w-full py-20 md:py-24 overflow-hidden bg-[#01b0ef] group border-y-4 border-[#fdb913]">
            {/* Background Video Loop (Muted) */}
            <div className="absolute inset-0 z-0">
                {!videoError ? (
                    <video
                        src={videoSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        onError={() => setVideoError(true)}
                        className="w-full h-full object-cover opacity-55 scale-105 group-hover:scale-100 transition-transform duration-[2s]"
                        aria-hidden="true"
                    />
                ) : (
                    <img
                        src="/images/hero-slider-2.jpg"
                        alt="Vista de São Tomé"
                        className="w-full h-full object-cover opacity-50"
                    />
                )}
                {/* Luminous Brand Blue Tint */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#01b0ef]/75 via-[#01b0ef]/50 to-[#01b0ef]/80" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fdb913] text-slate-900 text-xs font-extrabold mb-8 shadow-md"
                >
                    <Film size={14} />
                    <span>Vídeo Institucional • Nossa Terra e Nossa Gente</span>
                </motion.div>

                {/* Play Button */}
                <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    viewport={{ once: true }}
                    onClick={() => setIsOpen(true)}
                    className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-[#fdb913] hover:brightness-105 text-slate-900 rounded-full shadow-[0_0_45px_rgba(253,185,19,0.55)] transition-all mb-8 border-4 border-white"
                    aria-label="Assistir vídeo institucional completo"
                >
                    <div className="absolute inset-0 rounded-full bg-[#fdb913]/40 animate-ping" />
                    <Play size={34} className="relative z-10 ml-1 fill-current" />
                </motion.button>

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    viewport={{ once: true }}
                    className="max-w-2xl"
                >
                    <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight drop-shadow-sm">
                        Conheça as riquezas e a história de{" "}
                        <span className="text-[#fdb913]">São Tomé</span>
                    </h2>
                    <p className="text-white/95 text-base md:text-lg font-medium leading-relaxed drop-shadow-xs">
                        Um olhar especial sobre a nossa cultura, o trabalho da nossa gente e o desenvolvimento do nosso município no coração do Potengi.
                    </p>
                </motion.div>
            </div>

            {/* Video Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-950/90 backdrop-blur-xl"
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-[#fdb913] text-slate-900 rounded-full transition-all z-[110] shadow-lg"
                            aria-label="Fechar vídeo"
                        >
                            <X size={24} />
                        </button>

                        <motion.div
                            initial={{ scale: 0.94, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.94, opacity: 0 }}
                            className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border-2 border-[#01b0ef]"
                        >
                            <video
                                src={videoSrc}
                                controls
                                autoPlay
                                className="w-full h-full"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
