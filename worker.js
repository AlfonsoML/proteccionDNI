'use strict'

/**
* Convertir todo a blanco y negro
*/
function ConvertirBN(canvas) {
	const w = canvas.width;
	const h = canvas.height;
	const ctx = canvas.getContext('2d', { willReadFrequently: true });

	try {
		const imgPixels = ctx.getImageData(0, 0, w, h);
		for (let y = 0; y < imgPixels.height; y++) {
			for (let x = 0; x < imgPixels.width; x++) {
				const i = (y * 4) * imgPixels.width + x * 4;
				const avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
				imgPixels.data[i] = avg;
				imgPixels.data[i + 1] = avg;
				imgPixels.data[i + 2] = avg;
			}
		}
		ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
	} catch (e) {
		// da error al usar imagen de prueba con file://
	}
}

// Si la imagen parece estar en vertical, girarla automáticamente por defecto
function PonerHorizontal(img) {
	let width = img.width;
	let height = img.height;

	if (height > width) {
		const ancho = height;
		const alto = width;
		const canvasGiro = new OffscreenCanvas(ancho, alto);

		const ctxRotado = canvasGiro.getContext('2d');
		ctxRotado.clearRect(0, 0, ancho, alto);
		// save the unrotated context of the canvas so we can restore it later
		// the alternative is to untranslate & unrotate after drawing
		ctxRotado.save();

		// move to the center of the canvas
		ctxRotado.translate(ancho / 2, alto / 2);

		// rotate the canvas to the specified degrees
		ctxRotado.rotate(270 * Math.PI / 180);

		// draw the image
		// since the context is rotated, the image will be rotated also
		ctxRotado.drawImage(img, - width / 2, - height / 2);

		// we’re done with the rotating so restore the unrotated context
		ctxRotado.restore();

		return canvasGiro;
	}

	const canvas = new OffscreenCanvas(img.width, img.height);
	const ctxImagen = canvas.getContext('2d');
	ctxImagen.drawImage(img, 0, 0);
	return canvas;
}

function ReducirAnchura(canvas) {
	// Limitamos a un ancho máximo de 2000px para mejorar rendimiento posterior
	const anchoMaximo = 2000;
	if (canvas.width <= anchoMaximo)
		return canvas;

	const width = anchoMaximo;
	const height = anchoMaximo * canvas.height / canvas.width;

	const canvasEscalado = new OffscreenCanvas(width, height);
	const ctxImagen = canvasEscalado.getContext('2d');
	ctxImagen.drawImage(canvas, 0, 0, width, height);
	return canvasEscalado;
}

self.addEventListener('message', e => {
	const img = e.data.bitmap;

	const canvas = ReducirAnchura(PonerHorizontal(img));

	ConvertirBN(canvas);

	const bitmap = canvas.transferToImageBitmap();
	self.postMessage(bitmap);
});