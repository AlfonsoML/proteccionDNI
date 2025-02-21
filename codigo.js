'use strict';

const canvas = document.getElementById('canvas');
/*
const canvasEl = document.querySelector('canvas');
const canvas =
  'OffscreenCanvas' in window
    ? canvasEl.transferControlToOffscreen()
    : canvasEl;
*/
/*
const offscreen = new OffscreenCanvas(canvas.width, canvas.height);
const ctxPrincipal = canvas.getContext('2d', { alpha: false });
const ctx = offscreen.getContext('2d', { alpha: false });
*/
const ctx = canvas.getContext('2d', { alpha: false });

const canvasImagen = new OffscreenCanvas(0, 0);

//const ctx = canvas.getContext('2d', { willReadFrequently: true });
const img = new Image;

const SelectorFichero = document.getElementById('SelectorFichero');
const Formato = document.getElementById('Formato');
const Watermark = document.getElementById('Watermark');

const Rotacion = document.getElementById('Rotacion');
const Horizontal = document.getElementById('Horizontal');
const Vertical = document.getElementById('Vertical');
const Zoom = document.getElementById('Zoom');

// Ángulo de rotación del DNI (0, 90, 180, 270)
let rotacion = 0;

// Rellenar la lista de formatos de DNI automáticamente
const opciones = []; 
for (const [key, value] of Object.entries(FormatosDnis)) {
	opciones.push(`<option value='${key}'>${value.Nombre}</option>`);
}
Formato.innerHTML = opciones.join('');

// asignar escucha de eventos
SelectorFichero.addEventListener('change', function (e) {
	const fichero = e.target.files[0];
	if (fichero) {
		MostrarImagen(fichero);
	}
});

// botón "bonito" para el usuario
//document.getElementById('ElegirFoto')
//	.addEventListener('click', () => SelectorFichero.click());
document.querySelector('#paso1 p')
	.addEventListener('click', (ev) => {
		SelectorFichero.click();
	});

const controles = [Formato, Watermark, Rotacion, Horizontal, Vertical, Zoom];

controles.forEach(function (control) {
	control.addEventListener('change', function (e) {
		RedibujarComposicion();
	});
});

// Al hacer click guardarla
document.getElementById('Guardar')
	.addEventListener('click', GrabarImagen);

configurarDobleClickComoReset('#ControlesDesplazamiento');
configurarGiro();


/**
Giros de 90º del DNI
*/
function configurarGiro() {
	const botones = querySelector_Array('input.girar');
	botones.forEach(boton => boton.addEventListener('click', girarDNI));
}

function girarDNI(ev) {
	const boton = ev.target;
	const giro = parseInt(boton.dataset.giro, 10);
	rotacion += giro;
	if (rotacion > 360)
		rotacion -= 360;
	if (rotacion < 0)
		rotacion += 360;

	RedibujarComposicion();
}

/** 
Al hacer doble click en el label, que vuelva a poner el control a 0
*/
function configurarDobleClickComoReset(contenedor) {
	const labels = querySelector_Array(contenedor + ' label');
	labels.forEach(label => label.addEventListener('dblclick', function (ev) {
		const lbl = ev.target;
		const input = document.getElementById(lbl.htmlFor);
		input.value = input.defaultValue;

		input.dispatchEvent(new Event('input'));
		input.dispatchEvent(new Event('change'));
	}));
}

/**
 * Dibujar cargar la imagen en img, dejar en blanco y negro y comenzar proceso
 * @param {any} file
 */
function MostrarImagen(file) {
	console.time('Cargar imagen');
	img.onload = function () {
		console.timeEnd('Cargar imagen');
		URL.revokeObjectURL(img.src)

		ResetearControles();

		canvasImagen.width = img.width;
		canvasImagen.height = img.height;

		console.time('Dibujar imagen');
		const ctxImagen = canvasImagen.getContext('2d', { alpha: false });
		ctxImagen.drawImage(img, 0, 0);
		console.timeEnd('Dibujar imagen');

		console.time('BN');
		ConvertirBN(canvasImagen, ctxImagen);
		console.timeEnd('BN');

		RedibujarComposicion();

		document.getElementById('paso2').open = true;
	}
	img.src = URL.createObjectURL(file);
}

function ResetearControles() {
	rotacion = 0;

	[Rotacion, Horizontal, Vertical, Zoom].forEach(function (control) {
		control.value = control.defaultValue;
	});
}

/**
Proceso de protección del DNI
*/
function RedibujarComposicion() {
	if (canvasImagen.width == 0 || canvasImagen.height == 0)
		return;

	console.time('Borrar');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	console.timeEnd('Borrar');

	let canvasOrigen = canvasImagen;
	// rotar ángulos rectos
	if (rotacion != 0) {
		const ancho = rotacion == 180 ? canvasOrigen.width : canvasOrigen.height;
		const alto = rotacion == 180 ? canvasOrigen.height : canvasOrigen.width;
		const canvasGiro = new OffscreenCanvas(ancho, alto);

		console.time('Rotar ' + rotacion);
		const ctxRotado = canvasGiro.getContext('2d');
		ctxRotado.clearRect(0, 0, canvasGiro.width, canvasGiro.height);
		// save the unrotated context of the canvas so we can restore it later
		// the alternative is to untranslate & unrotate after drawing
		ctxRotado.save();

		// move to the center of the canvas
		ctxRotado.translate(canvasGiro.width / 2, canvasGiro.height / 2);

		// rotate the canvas to the specified degrees
		ctxRotado.rotate(rotacion * Math.PI / 180);

		// draw the image
		// since the context is rotated, the image will be rotated also
		ctxRotado.drawImage(canvasOrigen, - canvasOrigen.width / 2, - canvasOrigen.height / 2);

		// we’re done with the rotating so restore the unrotated context
		ctxRotado.restore();
		console.timeEnd('Rotar ' + rotacion);
		canvasOrigen = canvasGiro;
	}

	// pequeños ajustes de ángulo
	const degrees = Rotacion.value;
	if (degrees != 0) {
		const canvasAjusteAngulo = new OffscreenCanvas(canvasOrigen.width, canvasOrigen.height);

		console.time('Rotar');
		const ctxRotado = canvasAjusteAngulo.getContext('2d');
		ctxRotado.clearRect(0, 0, canvasAjusteAngulo.width, canvasAjusteAngulo.height);
		// save the unrotated context of the canvas so we can restore it later
		// the alternative is to untranslate & unrotate after drawing
		ctxRotado.save();

		// move to the center of the canvas
		ctxRotado.translate(canvasAjusteAngulo.width / 2, canvasAjusteAngulo.height / 2);

		// rotate the canvas to the specified degrees
		ctxRotado.rotate(degrees * Math.PI / 180);

		// draw the image
		// since the context is rotated, the image will be rotated also
		ctxRotado.drawImage(canvasOrigen, - canvasOrigen.width / 2, - canvasOrigen.height / 2);

		// we’re done with the rotating so restore the unrotated context
		ctxRotado.restore();
		console.timeEnd('Rotar');
		canvasOrigen = canvasAjusteAngulo;
	}

	console.time('Imagen');
	ctx.drawImage(canvasOrigen, Horizontal.value, Vertical.value, canvas.width * Zoom.value, canvas.height * Zoom.value);
	console.timeEnd('Imagen');

	console.time('Mascara');
	DibujarMascara();
	console.timeEnd('Mascara');

	console.time('Watermark');
	DibujarMarcaAgua();
	console.timeEnd('Watermark');

/*
	console.time('Dibujar desde offscreen');
	ctxPrincipal.drawImage(offscreen, 0, 0);
	console.timeEnd('Dibujar desde offscreen');
	*/
}

/** Ocultar las partes de la imagen que no hacen ninguna falta, dependerá del formato de DNI y el lado */
function DibujarMascara() {
	const bloques = FormatosDnis[Formato.value].Mascaras;

	ctx.fillStyle = 'black';
	bloques.forEach(bloque => ctx.fillRect(bloque.x, bloque.y, bloque.w, bloque.h));
}

function DibujarMarcaAgua() {
	const texto = Watermark.value;

	const marcas = FormatosDnis[Formato.value].Watermarks;
	marcas.forEach(marca => {
		RellenarTexto(texto, ctx, marca.fuente, marca.estilo, marca.bb.x, marca.bb.y, marca.bb.w, marca.bb.h);
	});

}

// Objeto para mantener caché de las métricas del texto sin recalcular
const CacheMetricas = {};

/**
 * Escribir un texto en la zona delimitada haciendo wrap letra a letra y repitiendo hasta llenar
 * @param {any} texto
 * @param {any} x
 * @param {any} y
 * @param {any} maxWidth
 * @param {any} maxHeight
 */
function RellenarTexto(texto, ctx, fuente, estilo, x, y, maxWidth, maxHeight) {
	ctx.font = fuente;
	ctx.fillStyle = estilo;

	// Calcular altura de linea con la fuente actual
	const metrics = ctx.measureText("A");
	const lineHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
	const yMax = y + maxHeight - lineHeight;

	// Dividir el texto en letras (con un separador final para repeticiones)
	const letras = (texto + ' - ').split('');

	// Obtenemos las metricas de anchura cacheada o creamos un objeto nuevo
	const key = fuente + estilo;
	let Metricas = CacheMetricas[key];
	if (!Metricas) {
		Metricas = {};
		CacheMetricas[key] = Metricas;
	}
	// validamos que todas las letras están en nuestra caché o las añadimos
	letras.forEach(letra => {
		if (Metricas[letra])
			return;
		Metricas[letra] = ctx.measureText(letra).width;
	});

	let line = ''; // Linea que vamos a escribir

	// bucle hasta rellenar toda la zona, vamos letra a letra
	let n = 0;
	let ancho = 0;
	while (true) {
		const letra = letras[n];
		// Medir la anchura que tendrá si añadimos esta letra
		const anchoLetra = Metricas[letra];
		const testWidth = ancho + anchoLetra;
		// If the width of this test line is more than the max width
		if (testWidth > maxWidth && n > 0) {
			// escribir el texto
			ctx.fillText(line, x, y);
			// Nos movemos abajo según la altura calculada
			y += lineHeight;
			// cuando superemos el límite vertical paramos
			if (y >= yMax)
				return;

			// Comenzamos una linea nueva con esta letra
			line = letra;
			ancho = 0;
		} else {
			// Si no hemos superado la anchura, la añadimos a la linea actual
			line += letra;
			ancho += anchoLetra;
		}
		// cuando llegamos al final, reseteamos para volver
		if (n === letras.length - 1)
			n = 0;
		else
			n++;
	}
}


/**
 * Convertir todo a blanco y negro
 */
function ConvertirBN(canvas, ctx) {
	const w = canvas.width;
	const h = canvas.height;

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
		// da error al usar imagen de prueba
	}
}

function GrabarImagen() {
	const link = document.getElementById('grabar');
	link.download = 'Protegido.jpg';
	link.href = canvas.toDataURL('image/jpeg', 0.8);
	link.click();
}

/**
 * Returns an Array with the result of a querySelectorAll call (a NodeList)
 * @param {any} selector
 * @param {any} root
 * @returns
 */
function querySelector_Array(selector, root) {
	return [].slice.call((root || document).querySelectorAll(selector));
}