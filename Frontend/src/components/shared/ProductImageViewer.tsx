import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  SyntheticEvent,
  TouchEvent as ReactTouchEvent,
  WheelEvent as ReactWheelEvent,
} from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { createPortal } from "react-dom";
import { GOLD } from "../../store/constants";

type Point = { x: number; y: number };
type Size = { width: number; height: number };

type ProductImageViewerProps = {
  images: string[];
  index: number;
  name: string;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function fitWithin(natural: Size | null, frame: Size): Size {
  if (!natural || natural.width <= 0 || natural.height <= 0 || frame.width <= 0 || frame.height <= 0) {
    return { width: frame.width, height: frame.height };
  }

  const scale = Math.min(frame.width / natural.width, frame.height / natural.height, 1);
  return {
    width: natural.width * scale,
    height: natural.height * scale,
  };
}

export function ProductImageViewer({ images, index, name, onClose, onIndexChange }: ProductImageViewerProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const dragOriginRef = useRef<Point | null>(null);
  const dragOffsetRef = useRef<Point>({ x: 0, y: 0 });
  const touchOriginRef = useRef<{ point: Point; time: number } | null>(null);
  const pinchRef = useRef<{ startDistance: number; startScale: number } | null>(null);
  const lastTapRef = useRef<{ time: number; point: Point; index: number } | null>(null);
  const scaleRef = useRef(1);
  const offsetRef = useRef<Point>({ x: 0, y: 0 });
  const maxScaleRef = useRef(1);

  const [naturalSize, setNaturalSize] = useState<Size | null>(null);
  const [frameSize, setFrameSize] = useState<Size>({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [swipeOffset, setSwipeOffset] = useState(0);

  const hasMultiple = images.length > 1;
  const fittedSize = fitWithin(naturalSize, frameSize);
  const maxScale =
    naturalSize && fittedSize.width > 0 && fittedSize.height > 0
      ? clamp(
          Math.min(naturalSize.width / fittedSize.width, naturalSize.height / fittedSize.height, 4),
          1,
          4,
        )
      : 1;

  scaleRef.current = scale;
  offsetRef.current = offset;
  maxScaleRef.current = maxScale;

  const updateFrameSize = () => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    setFrameSize({ width: rect.width, height: rect.height });
  };

  const clampOffset = (nextOffset: Point, nextScale: number) => {
    if (fittedSize.width <= 0 || fittedSize.height <= 0) return { x: 0, y: 0 };

    const maxX = Math.max(0, (fittedSize.width * nextScale - fittedSize.width) / 2);
    const maxY = Math.max(0, (fittedSize.height * nextScale - fittedSize.height) / 2);

    return {
      x: clamp(nextOffset.x, -maxX, maxX),
      y: clamp(nextOffset.y, -maxY, maxY),
    };
  };

  const resetTransform = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setSwipeOffset(0);
    dragOriginRef.current = null;
    dragOffsetRef.current = { x: 0, y: 0 };
    pinchRef.current = null;
  };

  const goToIndex = (nextIndex: number) => {
    if (!images.length) return;
    const wrappedIndex = (nextIndex + images.length) % images.length;
    onIndexChange(wrappedIndex);
    setNaturalSize(null);
    resetTransform();
  };

  const zoomTo = (nextScale: number, clientPoint?: Point) => {
    const boundedScale = clamp(nextScale, 1, maxScaleRef.current);
    if (boundedScale <= 1) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
      return;
    }

    if (!clientPoint || !frameRef.current) {
      setScale(boundedScale);
      setOffset((current) => clampOffset(current, boundedScale));
      return;
    }

    const rect = frameRef.current.getBoundingClientRect();
    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const relX = clientPoint.x - center.x - offsetRef.current.x;
    const relY = clientPoint.y - center.y - offsetRef.current.y;
    const ratio = boundedScale / scaleRef.current;

    const nextOffset = clampOffset(
      {
        x: offsetRef.current.x - relX * (ratio - 1),
        y: offsetRef.current.y - relY * (ratio - 1),
      },
      boundedScale,
    );

    setScale(boundedScale);
    setOffset(nextOffset);
  };

  useLayoutEffect(() => {
    updateFrameSize();
  }, []);

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onResize = () => updateFrameSize();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowLeft" && hasMultiple) {
        goToIndex(index - 1);
        return;
      }
      if (event.key === "ArrowRight" && hasMultiple) {
        goToIndex(index + 1);
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!dragOriginRef.current || scaleRef.current <= 1) return;
      const nextOffset = clampOffset(
        {
          x: dragOffsetRef.current.x + event.clientX - dragOriginRef.current.x,
          y: dragOffsetRef.current.y + event.clientY - dragOriginRef.current.y,
        },
        scaleRef.current,
      );
      setOffset(nextOffset);
    };

    const onMouseUp = () => {
      dragOriginRef.current = null;
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    const rafId = window.requestAnimationFrame(updateFrameSize);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [goToIndex, hasMultiple, index, onClose]);

  useEffect(() => {
    setOffset((current) => clampOffset(current, scale));
  }, [frameSize.height, frameSize.width, fittedSize.height, fittedSize.width, scale]);

  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    setNaturalSize({ width: image.naturalWidth, height: image.naturalHeight });
  };

  const handleBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const deltaScale = event.deltaY < 0 ? 1.18 : 0.86;
    zoomTo(scaleRef.current * deltaScale, { x: event.clientX, y: event.clientY });
  };

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (scaleRef.current <= 1 || event.button !== 0) return;
    event.preventDefault();
    dragOriginRef.current = { x: event.clientX, y: event.clientY };
    dragOffsetRef.current = offsetRef.current;
  };

  const handleDoubleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (maxScaleRef.current <= 1) return;
    if (scaleRef.current > 1.05) {
      resetTransform();
      return;
    }
    zoomTo(Math.min(maxScaleRef.current, 2), { x: event.clientX, y: event.clientY });
  };

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      const a = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      const b = { x: event.touches[1].clientX, y: event.touches[1].clientY };
      pinchRef.current = {
        startDistance: distance(a, b),
        startScale: scaleRef.current,
      };
      return;
    }

    if (event.touches.length === 1) {
      const point = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      touchOriginRef.current = { point, time: Date.now() };
      dragOffsetRef.current = offsetRef.current;
    }
  };

  const handleTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2 && pinchRef.current) {
      event.preventDefault();
      const a = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      const b = { x: event.touches[1].clientX, y: event.touches[1].clientY };
      const nextDistance = distance(a, b);
      const nextScale = pinchRef.current.startScale * (nextDistance / pinchRef.current.startDistance);
      zoomTo(nextScale, midpoint(a, b));
      return;
    }

    if (event.touches.length !== 1 || !touchOriginRef.current) return;

    const point = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    const deltaX = point.x - touchOriginRef.current.point.x;
    const deltaY = point.y - touchOriginRef.current.point.y;

    if (scaleRef.current > 1) {
      event.preventDefault();
      const nextOffset = clampOffset(
        {
          x: dragOffsetRef.current.x + deltaX,
          y: dragOffsetRef.current.y + deltaY,
        },
        scaleRef.current,
      );
      setOffset(nextOffset);
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      event.preventDefault();
      setSwipeOffset(deltaX * 0.8);
    }
  };

  const handleTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (event.touches.length > 0) {
      if (event.touches.length === 1) {
        pinchRef.current = null;
        touchOriginRef.current = {
          point: { x: event.touches[0].clientX, y: event.touches[0].clientY },
          time: Date.now(),
        };
        dragOffsetRef.current = offsetRef.current;
      }
      return;
    }

    const origin = touchOriginRef.current;
    touchOriginRef.current = null;
    pinchRef.current = null;

    if (!origin) {
      setSwipeOffset(0);
      return;
    }

    const changed = event.changedTouches[0];
    const point = { x: changed.clientX, y: changed.clientY };
    const deltaX = point.x - origin.point.x;
    const deltaY = point.y - origin.point.y;
    const elapsed = Date.now() - origin.time;

    if (scaleRef.current <= 1 && Math.abs(deltaX) > 70 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      setSwipeOffset(0);
      goToIndex(deltaX < 0 ? index + 1 : index - 1);
      return;
    }

    setSwipeOffset(0);

    const lastTap = lastTapRef.current;
    const isTap = Math.abs(deltaX) < 12 && Math.abs(deltaY) < 12 && elapsed < 250;
    const isDoubleTap =
      isTap &&
      lastTap &&
      lastTap.index === index &&
      Date.now() - lastTap.time < 280 &&
      distance(point, lastTap.point) < 28;

    if (isDoubleTap && maxScaleRef.current > 1) {
      if (scaleRef.current > 1.05) {
        resetTransform();
      } else {
        zoomTo(Math.min(maxScaleRef.current, 2), point);
      }
      lastTapRef.current = null;
      return;
    }

    if (isTap) {
      lastTapRef.current = { time: Date.now(), point, index };
    }
  };

  const arrowButtonStyle = {
    background: "rgba(26,26,26,0.82)",
    border: "1px solid rgba(212,175,55,0.18)",
    color: "#F8F8F8",
    boxShadow: "0 12px 36px rgba(0,0,0,0.24)",
    backdropFilter: "blur(16px)",
  } as const;

  return createPortal(
    <div
      className="fullscreen-viewer-fade fixed inset-0 z-[100] flex items-center justify-center"
      dir="rtl"
      onClick={handleBackdropClick}
      style={{ overscrollBehavior: "contain" }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: "var(--background)", opacity: 0.9 }} />

      <div className="relative z-[1] flex h-full w-full flex-col">
        <div className="pointer-events-none absolute top-4 left-4 right-4 z-[2] flex items-center justify-between gap-3 md:top-6 md:left-6 md:right-6">
          <button
            type="button"
            onClick={onClose}
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full transition-all hover:scale-[1.03]"
            aria-label="إغلاق عارض الصور"
            style={arrowButtonStyle}
          >
            <X size={20} />
          </button>

          <div
            className="pointer-events-auto rounded-full px-4 py-2 text-sm font-bold text-white"
            dir="ltr"
            style={arrowButtonStyle}
          >
            {index + 1} / {images.length}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-20 md:px-8 md:py-24">
          {hasMultiple && (
            <button
              type="button"
              onClick={() => goToIndex(index + 1)}
              className="absolute left-3 top-1/2 z-[2] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full transition-all hover:scale-[1.03] md:flex"
              aria-label="الصورة التالية"
              style={arrowButtonStyle}
            >
              <ChevronLeft size={22} />
            </button>
          )}

          <div
            ref={frameRef}
            className="fullscreen-viewer-stage relative flex h-full w-full max-w-[92vw] items-center justify-center overflow-hidden rounded-[28px] md:max-w-[88vw]"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              maxHeight: "84vh",
              border: "1px solid rgba(212,175,55,0.14)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.28)",
              touchAction: "none",
            }}
          >
            <div
              className="fullscreen-viewer-zoom"
              style={{
                transform: `translate3d(${offset.x + swipeOffset}px, ${offset.y}px, 0)`,
                transition: dragOriginRef.current || pinchRef.current ? "none" : "transform 220ms ease",
                willChange: "transform",
              }}
            >
              <img
                key={images[index]}
                src={images[index]}
                alt={name}
                onLoad={handleImageLoad}
                draggable={false}
                className="fullscreen-viewer-image select-none"
                style={{
                  width: fittedSize.width > 0 ? fittedSize.width : undefined,
                  height: fittedSize.height > 0 ? fittedSize.height : undefined,
                  maxWidth: "92vw",
                  maxHeight: "84vh",
                  transform: `scale(${scale})`,
                  transition: pinchRef.current ? "none" : "transform 220ms ease",
                  transformOrigin: "center center",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
                  borderRadius: 24,
                }}
              />
            </div>
          </div>

          {hasMultiple && (
            <button
              type="button"
              onClick={() => goToIndex(index - 1)}
              className="absolute right-3 top-1/2 z-[2] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full transition-all hover:scale-[1.03] md:flex"
              aria-label="الصورة السابقة"
              style={arrowButtonStyle}
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>

        {hasMultiple && (
          <div className="pointer-events-none absolute inset-x-0 bottom-5 z-[2] flex justify-center px-4">
            <div className="pointer-events-auto flex items-center gap-2 rounded-full px-3 py-2" style={arrowButtonStyle}>
              {images.map((_, imageIndex) => (
                <button
                  key={imageIndex}
                  type="button"
                  onClick={() => goToIndex(imageIndex)}
                  className="h-2.5 rounded-full transition-all"
                  aria-label={`عرض الصورة ${imageIndex + 1}`}
                  style={{
                    width: imageIndex === index ? 22 : 10,
                    background: imageIndex === index ? GOLD : "rgba(248,248,248,0.35)",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
