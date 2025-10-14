"use client"

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from "react"
import { useAnimationFrame } from "framer-motion"

import { cn } from "@/utils"
import { useMousePositionRef } from "./use-mouse-position-ref"

interface FloatingContextType {
    registerElement: (id: string, element: HTMLDivElement, depth: number) => void
    unregisterElement: (id: string) => void
}

const FloatingContext = createContext<FloatingContextType | null>(null)

interface FloatingProps {
    children: ReactNode
    className?: string
    sensitivity?: number
    easingFactor?: number
}

const Floating = ({
    children,
    className,
    sensitivity = 1,
    easingFactor = 0.15, // Much faster easing for quicker animations
    ...props
}: FloatingProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const elementsMap = useRef(
        new Map<
            string,
            {
                element: HTMLDivElement
                depth: number
                currentPosition: { x: number; y: number }
                targetPosition: { x: number; y: number }
            }
        >()
    )
    const mousePositionRef = useMousePositionRef(containerRef as unknown as React.RefObject<HTMLElement | SVGElement>)
    const lastMousePosition = useRef({ x: 0, y: 0 })
    const animationId = useRef<number | null>(null)

    const registerElement = useCallback(
        (id: string, element: HTMLDivElement, depth: number) => {
            elementsMap.current.set(id, {
                element,
                depth,
                currentPosition: { x: 0, y: 0 },
                targetPosition: { x: 0, y: 0 },
            })
        },
        []
    )

    const unregisterElement = useCallback((id: string) => {
        elementsMap.current.delete(id)
    }, [])

    // Optimized animation loop that only runs when needed
    const updateElements = useCallback(() => {
        if (!containerRef.current) return

        const mousePos = mousePositionRef.current
        const threshold = 0.1 // Minimum movement threshold
        let needsUpdate = false

        // Check if mouse position changed significantly
        const mouseMoved = Math.abs(mousePos.x - lastMousePosition.current.x) > threshold ||
                          Math.abs(mousePos.y - lastMousePosition.current.y) > threshold

        elementsMap.current.forEach((data) => {
            const strength = (data.depth * sensitivity) / 20

            // Calculate new target position
            const newTargetX = mousePos.x * strength
            const newTargetY = mousePos.y * strength

            // Update target if mouse moved
            if (mouseMoved) {
                data.targetPosition.x = newTargetX
                data.targetPosition.y = newTargetY
            }

            // Calculate distance to target
            const dx = data.targetPosition.x - data.currentPosition.x
            const dy = data.targetPosition.y - data.currentPosition.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            // Only update if movement is significant enough
            if (distance > threshold) {
                data.currentPosition.x += dx * easingFactor
                data.currentPosition.y += dy * easingFactor

                data.element.style.transform = `translate3d(${data.currentPosition.x}px, ${data.currentPosition.y}px, 0)`
                needsUpdate = true
            }
        })

        lastMousePosition.current = { x: mousePos.x, y: mousePos.y }

        // Continue animation loop only if elements are still moving
        if (needsUpdate) {
            animationId.current = requestAnimationFrame(updateElements)
        } else {
            animationId.current = null
        }
    }, [sensitivity, easingFactor, mousePositionRef])

    // Start animation when mouse moves
    useEffect(() => {
        const startAnimation = () => {
            if (!animationId.current) {
                animationId.current = requestAnimationFrame(updateElements)
            }
        }

        const container = containerRef.current
        if (container) {
            container.addEventListener('mousemove', startAnimation)
            return () => {
                container.removeEventListener('mousemove', startAnimation)
                if (animationId.current) {
                    cancelAnimationFrame(animationId.current)
                }
            }
        }
    }, [updateElements])

    return (
        <FloatingContext.Provider value={{ registerElement, unregisterElement }}>
            <div
                ref={containerRef}
                className={cn("absolute top-0 left-0 w-full h-full z-50", className)}
                {...props}
            >
                {children}
            </div>
        </FloatingContext.Provider>
    )
}

export default Floating

interface FloatingElementProps {
    children: ReactNode
    className?: string
    depth?: number
}

export const FloatingElement = ({
    children,
    className,
    depth = 1,
}: FloatingElementProps) => {
    const elementRef = useRef<HTMLDivElement>(null)
    const idRef = useRef(Math.random().toString(36).substring(7))
    const context = useContext(FloatingContext)

    useEffect(() => {
        if (!elementRef.current || !context) return

        const nonNullDepth = depth ?? 0.01

        context.registerElement(idRef.current, elementRef.current, nonNullDepth)
        return () => context.unregisterElement(idRef.current)
    }, [depth])

    return (
        <div
            ref={elementRef}
            className={cn("absolute will-change-transform z-50", className)}
        >
            {children}
        </div>
    )
}