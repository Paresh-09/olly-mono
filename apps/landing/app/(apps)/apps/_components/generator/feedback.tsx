"use client"

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@repo/ui/components/ui/button";
import { Textarea } from "@repo/ui/components/ui/textarea";

interface FeedbackDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function FeedbackDialog({ open, onClose }: FeedbackDialogProps) {
    const [feedback, setFeedback] = useState("");
    const [feedbackType, setFeedbackType] = useState("like");

    const handleSubmit = async () => {
        try {
            await fetch("/api/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ feedbackType, feedback }),
            });
            onClose();
        } catch (error) {
            console.error("Error submitting feedback:", error);
        }
    };

    const handleSkip = async () => {
        try {
            await fetch("/api/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ skipped: true }),
            });
            onClose();
        } catch (error) {
            console.error("Error submitting skip:", error);
        }
    };

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={onClose}>
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                        &#8203;
                    </span>

                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
                            <div>
                                <div className="mt-3 text-center sm:mt-5">
                                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                        Feedback
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Please provide your feedback on the generated comment.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-6">
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="like"
                                            name="feedbackType"
                                            value="like"
                                            checked={feedbackType === "like"}
                                            onChange={(e) => setFeedbackType(e.target.value)}
                                            className="mr-2"
                                        />
                                        <label htmlFor="like">Like</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="dislike"
                                            name="feedbackType"
                                            value="dislike"
                                            checked={feedbackType === "dislike"}
                                            onChange={(e) => setFeedbackType(e.target.value)}
                                            className="mr-2"
                                        />
                                        <label htmlFor="dislike">Dislike</label>
                                    </div>
                                    <Textarea
                                        className="w-full"
                                        placeholder="Please provide your feedback..."
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                    />
                                    <div className="flex justify-between">
                                        <Button className="w-1/2 mr-2" onClick={handleSubmit}>
                                            Submit
                                        </Button>
                                        <Button className="w-1/2" variant="outline" onClick={handleSkip}>
                                            Skip
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    );
}