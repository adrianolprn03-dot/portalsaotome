"use client";
import { useState } from "react";
import { Play, X, Film } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function VideoHero() {
    const [isOpen, setIsOpen] = useState(false);
    const [videoError, setVideoError] = useState(false);

    const videoSrc = "/video_saotome.mp4";

    return (
        <section className="relative w-full py-24 md:py-28 overflow-hidden bg-[#071E3D] group">
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
                        className="w-full h-full object-cover opacity-45 scale-105 group-hover:scale-100 transition-transform duration-[2s]"
                        aria-hidden="true"
                    />
                ) : (
                    <img
                        src="/images/hero-slider-2.jpg"
                        alt="Vista de São Tomé"
                        className="w-full h-full object-cover opacity-40"
                    />
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#071E3D]/90 via-[#071E3D]/55 to-[#071E3D]/90" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold mb-8"
                >
                    <Film size={14} className="text-secondary-400" />
                    <span> Institucional • Nossa Terra e Nossa Gente</span>
                </motion.div>

                {/* Play Button */}
                <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    viewport={{ once: true }}
                    onClick={() => setIsOpen(true)}
                    className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-secondary-500 hover:bg-secondary-400 text-[#071E3D] rounded-full shadow-[0_0_50px_rgba(253,185,19,0.4)] transition-all mb-8"
                    aria-label="Assistir vídeo institucional completo"
                >
                    <div className="absolute inset-0 rounded-full bg-secondary-400/30 animate-ping" />
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
                    <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                        Conheça as riquezas e a história de{" "}
                        <span className="text-secondary-400">São Tomé</span>
                    </h2>
                    <p className="text-slate-200/85 text-base md:text-lg font-normal leading-relaxed">
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
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-xl"
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-[110]"
                            aria-label="Fechar vídeo"
                        >
                            <X size={28} />
                        </button>

                        <motion.div
                            initial={{ scale: 0.94, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.94, opacity: 0 }}
                            className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/15"
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
