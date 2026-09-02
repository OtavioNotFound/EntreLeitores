import { useEffect, useRef } from 'react';

export default function PdfPageCanvas({ document, page, scale = 1.2, onRendered }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!document || !canvasRef.current) return undefined;
    let cancelled = false;
    let renderTask;
    (async () => {
      const pdfPage = await document.getPage(page);
      if (cancelled || !canvasRef.current) return;
      const viewport = pdfPage.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { alpha: false });
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      canvas.style.width = `${Math.ceil(viewport.width)}px`;
      canvas.style.height = `${Math.ceil(viewport.height)}px`;
      renderTask = pdfPage.render({ canvas, canvasContext: context, viewport });
      await renderTask.promise;
      if (!cancelled) onRendered?.();
    })().catch(() => {});
    return () => { cancelled = true; renderTask?.cancel(); };
  }, [document, page, scale, onRendered]);

  return <canvas className="pdf-pagina" ref={canvasRef} aria-label={`Página ${page}`} />;
}
