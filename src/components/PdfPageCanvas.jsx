import { useEffect, useRef } from 'react';
import { TextLayer } from 'pdfjs-dist';

export default function PdfPageCanvas({ document, page, scale = 1.2, onRendered }) {
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);

  useEffect(() => {
    if (!document || !canvasRef.current || !textLayerRef.current) return undefined;
    let cancelled = false;
    let renderTask;
    let textLayer;
    (async () => {
      const pdfPage = await document.getPage(page);
      if (cancelled || !canvasRef.current || !textLayerRef.current) return;
      const viewport = pdfPage.getViewport({ scale });
      const canvas = canvasRef.current;
      const layer = textLayerRef.current;
      const context = canvas.getContext('2d', { alpha: false });
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      canvas.style.width = `${Math.ceil(viewport.width)}px`;
      canvas.style.height = `${Math.ceil(viewport.height)}px`;
      layer.replaceChildren();
      layer.style.width = `${Math.ceil(viewport.width)}px`;
      layer.style.height = `${Math.ceil(viewport.height)}px`;
      layer.style.setProperty('--scale-factor', String(viewport.scale));
      layer.style.setProperty('--total-scale-factor', String(viewport.scale));
      renderTask = pdfPage.render({ canvas, canvasContext: context, viewport });
      textLayer = new TextLayer({ textContentSource:pdfPage.streamTextContent(), container:layer, viewport });
      await Promise.all([renderTask.promise, textLayer.render()]);
      if (!cancelled) onRendered?.();
    })().catch(() => {});
    return () => { cancelled = true; renderTask?.cancel(); textLayer?.cancel(); };
  }, [document, page, scale, onRendered]);

  return <div className="pdf-pagina-wrapper" data-page={page}><canvas className="pdf-pagina" ref={canvasRef} aria-label={`Página ${page}`} /><div className="textLayer" ref={textLayerRef} /></div>;
}
