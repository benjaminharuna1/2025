import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonLoading,
} from "@ionic/react";
import {
  printOutline,
  downloadOutline,
  chevronBackCircleOutline,
  chevronForwardCircleOutline,
  addCircleOutline,
  removeCircleOutline,
} from "ionicons/icons";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";

// Use the matching pdf.js worker from unpkg
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const ReportCardPreviewPage: React.FC = () => {
  const location = useLocation();
  const locationState = location.state as { pdfUrl?: string } | undefined;

  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [scale, setScale] = useState(1.0); // zoom state

  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinchStartDistance = useRef<number | null>(null);

  // Load PDF URL
  useEffect(() => {
    const url =
      locationState?.pdfUrl || sessionStorage.getItem("reportCardPdfUrl");
    if (url) {
      setPdfUrl(url);
      setLoading(true);
    }
  }, [locationState]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));

  const handlePrint = () => {
    if (pdfUrl) {
      const newWindow = window.open(pdfUrl, "_blank");
      newWindow?.print();
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "report_card.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Zoom controls
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  // Handle pinch gestures
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dist = getDistance(e.touches[0], e.touches[1]);
        pinchStartDistance.current = dist;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchStartDistance.current) {
        const dist = getDistance(e.touches[0], e.touches[1]);
        const scaleChange = dist / pinchStartDistance.current;
        setScale((prev) => {
          let newScale = prev * scaleChange;
          newScale = Math.max(0.5, Math.min(newScale, 3.0));
          return newScale;
        });
        pinchStartDistance.current = dist; // update baseline
      }
    };

    const handleTouchEnd = () => {
      pinchStartDistance.current = null;
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove);
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  // Utility function to get distance between two fingers
  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/reports" />
          </IonButtons>
          <IonTitle>Report Card Preview</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handlePrint} disabled={!pdfUrl}>
              <IonIcon slot="icon-only" icon={printOutline} />
            </IonButton>
            <IonButton onClick={handleDownload} disabled={!pdfUrl}>
              <IonIcon slot="icon-only" icon={downloadOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonLoading isOpen={loading} message="Loading document..." />

        {pdfUrl ? (
          <div
            ref={containerRef}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              touchAction: "none", // allow custom pinch gestures
            }}
          >
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => {
                console.error("Failed to load PDF:", error);
                setLoading(false);
              }}
            >
              <Page pageNumber={pageNumber} scale={scale} />
            </Document>

            {/* Page Navigation */}
            {numPages && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginTop: "1rem",
                }}
              >
                <IonButton onClick={goToPrevPage} disabled={pageNumber <= 1}>
                  <IonIcon slot="icon-only" icon={chevronBackCircleOutline} />
                </IonButton>
                <p>
                  Page {pageNumber} of {numPages}
                </p>
                <IonButton
                  onClick={goToNextPage}
                  disabled={pageNumber >= numPages}
                >
                  <IonIcon
                    slot="icon-only"
                    icon={chevronForwardCircleOutline}
                  />
                </IonButton>
              </div>
            )}

            {/* Zoom Controls */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              <IonButton onClick={zoomOut} disabled={scale <= 0.5}>
                <IonIcon slot="icon-only" icon={removeCircleOutline} />
              </IonButton>
              <p>Zoom: {(scale * 100).toFixed(0)}%</p>
              <IonButton onClick={zoomIn} disabled={scale >= 3.0}>
                <IonIcon slot="icon-only" icon={addCircleOutline} />
              </IonButton>
            </div>
          </div>
        ) : (
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            No report card generated. Please go back and generate one.
          </p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ReportCardPreviewPage;
