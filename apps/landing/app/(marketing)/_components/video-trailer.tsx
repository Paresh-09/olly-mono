"use client";

import { PlayIcon, X } from "lucide-react";
import { Modal, useModal } from "@/components/modal";
import Image from "next/image";

export function VideoTrailer() {
    const { isModalOpen, openModal, closeModal } = useModal();

    return (
        <section className="py-12 sm:py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section Header */}

                {/* Video Container */}
                <div className={`mx-auto max-w-5xl transition-opacity duration-300 ${isModalOpen ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="relative overflow-hidden rounded-2xl bg-gray-900/5 dark:bg-gray-100/5 ring-1 ring-inset ring-gray-900/10 dark:ring-white/10">
                        {/* Video Thumbnail */}
                        <div className="relative aspect-video">
                            <Image
                                src="/new_video_thumbnail.webp"
                                alt="Olly Demo Video - See AI Social Media Automation in Action"
                                fill
                                className="object-cover"
                                priority
                                quality={85}
                            />

                            {/* Play Button Overlay */}
                            <div
                                className="group absolute inset-0 flex cursor-pointer items-center justify-center bg-black/20 transition-all duration-300 hover:bg-black/30"
                                onClick={openModal}
                            >
                                <div className="flex items-center justify-center">
                                    {/* Outer Ring */}
                                    <div className="absolute h-24 w-24 rounded-full bg-white/20 animate-ping"></div>
                                    <div className="absolute h-20 w-20 rounded-full bg-white/30 animate-pulse"></div>

                                    {/* Play Button */}
                                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-white">
                                        <PlayIcon className="h-7 w-7 ml-1 text-gray-900" fill="currentColor" />
                                    </div>
                                </div>

                                {/* Watch Demo Text */}
                                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 text-sm font-medium text-gray-900 shadow-lg transition-all duration-300 group-hover:bg-white group-hover:scale-105">
                                        <PlayIcon className="h-4 w-4" fill="currentColor" />
                                        Watch Demo
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Video Stats or Features */}

            </div>

            {/* Video Modal */}
            <Modal
                isOpen={isModalOpen}
                hideModal={closeModal}
                padding="none"
                size="6xl"
                backdropClass="backdrop-blur-sm bg-black/80"
            >
                <div className="relative aspect-video w-full">
                    {/* Close Button */}
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all duration-200"
                        aria-label="Close video"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    
                    <iframe
                        className="h-full w-full rounded-lg"
                        src="https://www.youtube.com/embed/Fe-oz0cyGDs?autoplay=1&rel=0&modestbranding=1"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        title="Olly AI Social Media Automation Demo"
                    />
                </div>
            </Modal>
        </section>
    );
}
