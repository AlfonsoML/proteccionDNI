'use strict';

const Previsualizacion = document.getElementById('Previsualizacion');
// canvas donde dibujamos el DNI con los ajustes de rotación y desplazamiento
const canvas = document.getElementById('canvas');
// canvas con las máscaras que tapan datos
const canvasMascara = document.createElement('canvas');
// canvas para la superposición de texto/marca de agua
const canvasWatermark = document.createElement('canvas');
// canvas para generar la imagen a descargar
const canvaComposicion = document.createElement('canvas');

canvasMascara.width = canvas.width;
canvasMascara.height = canvas.height;
Previsualizacion.appendChild(canvasMascara);

canvasWatermark.width = canvas.width;
canvasWatermark.height = canvas.height;
Previsualizacion.appendChild(canvasWatermark);

canvaComposicion.width = canvas.width;
canvaComposicion.height = canvas.height;

// Contiene la imagen del DNI elegida por el usuario a escala 1:1 y en blanco y negro, antes de girar, desplazar...
let imagenDNI_BN = null;

const SelectorFichero = document.getElementById('SelectorFichero');
const Formato = document.getElementById('Formato');
const Watermark = document.getElementById('Watermark');

const Rotacion = document.getElementById('Rotacion');
const Horizontal = document.getElementById('Horizontal');
const Vertical = document.getElementById('Vertical');
const Zoom = document.getElementById('Zoom');
const EnmascararDni = document.getElementById('EnmascararDni');
const DivMascaraDni = document.getElementById('DivMascaraDni');

let nombreFichero = '';

// Ángulo de rotación del DNI (0, 90, 180, 270)
let rotacion = 0;

// Rellenar la lista de formatos de DNI automáticamente
const opciones = [];
for (const [key, value] of Object.entries(FormatosDnis)) {
	opciones.push(`<option value='${key}'>${value.Nombre}</option>`);
}
Formato.innerHTML = opciones.join('');
Previsualizacion.style.display = 'none';

// asignar escucha de eventos
SelectorFichero.addEventListener('change', function (e) {
	const fichero = e.target.files[0];
	if (fichero) {
		Previsualizacion.style.display = '';

		MostrarImagen(fichero);
		nombreFichero = e.target.value;
		// borramos por si quieren volver a elegir la misma
		e.target.value = '';
	}
});

// botón "bonito" para el usuario
//document.getElementById('ElegirFoto')
//	.addEventListener('click', () => SelectorFichero.click());
document.querySelector('#paso1 p')
	.addEventListener('click', (ev) => {
		SelectorFichero.click();
	});

[Formato, EnmascararDni].forEach(function (control) {
	control.addEventListener('change', function (e) {
		if (e.target == Formato) {
			// ajustar visibilidad del checkbox de enmascarar DNI dependiendo de si el formato muestra el DNI o no
			const formato = FormatosDnis[Formato.value];
			DivMascaraDni.style.display = formato.MascarasDni ? '' : 'none';
		}

		DibujarMascara();
		DibujarMarcaAgua();
	});
});

[Rotacion, Horizontal, Vertical, Zoom].forEach(function (control) {
	control.addEventListener('input', function (e) {
		RedibujarDNI();
	});
});

Watermark.addEventListener('input', function (e) {
	DibujarMarcaAgua();
});

// Al hacer click guardarla
const botonGrabar = document.getElementById('Guardar');
botonGrabar.addEventListener('click', GrabarImagen);
botonGrabar.disabled = true;

configurarDobleClickComoReset('#ControlesDesplazamiento');
configurarGiro();

AsignarWatermarkPorDefecto(Watermark);

configurarCrearComposicion();

configurarWizard();

// Abrir información de ayuda al pulsar el enlace
document.getElementById('AyudaOcultarParcialmente')
	.addEventListener('click', () => document.getElementById('OcultarParcialmente').open = true);


function configurarWizard() {
	querySelector_Array('.step > *')
		.forEach(elmto => elmto.addEventListener('click', function (ev) {
			activarWizard(ev.target.parentNode);
		})
		);

	querySelector_Array('.Siguiente input')
		.forEach(btn => btn.addEventListener('click', function (ev) {
			const siguiente = ev.target.dataset.siguiente;
			activarWizard(document.getElementById('step' + siguiente));
		})
		);
}

function activarWizard(step) {
	const paso = step.id.substr(4); // ej: step4

	const actual = document.querySelector('.in-progress');
	const pasoActual = actual.id.substring(4);

	if (paso == pasoActual)
		return;

	if (!imagenDNI_BN) {
		alert('Escoje primero la imagen de tu DNI');
		return;
	}

	actual.classList.remove('in-progress');
	document.getElementById('paso' + pasoActual).open = false;

	step.classList.add('in-progress');
	document.getElementById('paso' + paso).open = true;

	let siguiente = step;
	while (siguiente) {
		siguiente.classList.remove('complete');
		siguiente = siguiente.nextElementSibling;
	}
	let anterior = step.previousElementSibling;
	while (anterior) {
		anterior.classList.add('complete');
		anterior = anterior.previousElementSibling;
	}
}

function configurarCrearComposicion() {
	// Al activar el paso de Grabar, crear la imagen offscreen con la mezcla de los tres canvas
	document.getElementById('paso5')
		.addEventListener('toggle', function (ev) {
			if (ev.target.hasAttribute('open')) {
				ComponerImagen();
			}
		});
}

function AsignarWatermarkPorDefecto(input) {
	const hoy = new Date();
	input.value = `Copia ${hoy.toISOString().substring(0, 10)} para …`;
}

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

	RedibujarDNI();
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
	const img = new Image;
	img.onload = function () {
		URL.revokeObjectURL(img.src)

		ResetearControles();

		PrepararDNI(img)
			.then(() => {
				RedibujarDNI();
				activarWizard(document.getElementById('step2'));
			});

		DibujarMascara();

		DibujarMarcaAgua();
	}
	img.src = URL.createObjectURL(file);
}

/**
Tomamos la imagen original del DNI y la preparamos a blanco y negro.
Deveuelve una promesa
*/
function PrepararDNI(img) {
	return new Promise((resolve, reject) => {

		function handler(e) {
			imagenDNI_BN = e.data;

			resolve();
		}

		procesadorDNI.addEventListener('message', handler);

		// creamos un objeto transferable que podamos enviar al WebWorker
		createImageBitmap(img)
			.then(bitmap => {
				procesadorDNI.postMessage({ bitmap });
			});
	});
}

/**
Se encarga de convertir la imagen original del DNI en una en blanco y negro mediante un webWorker
*/
const procesadorDNI = createWorker(() => {
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
			// da error al usar imagen de prueba con file://
		}
	}

	self.addEventListener('message', e => {
		const img = e.data.bitmap;
		const canvas = new OffscreenCanvas(img.width, img.height);

		const ctxImagen = canvas.getContext('2d', { willReadFrequently: true });
		ctxImagen.drawImage(img, 0, 0);

		ConvertirBN(canvas, ctxImagen);

		const bitmap = canvas.transferToImageBitmap();
		self.postMessage(bitmap);
	});
});

/**
Vuelve a poner los controles de posición y rotación con los valores iniciales
*/
function ResetearControles() {
	rotacion = 0;

	[Rotacion, Horizontal, Vertical, Zoom].forEach(function (control) {
		control.value = control.defaultValue;
	});
}

// Saber si tenemos pendiente un redibujo del DNI para no saturar la CPU/GPU
let redibujoDNIpendiente = false;

function RedibujarDNI() {
	if (imagenDNI_BN == null)
		return;

	if (redibujoDNIpendiente)
		return;

	redibujoDNIpendiente = true;
	requestAnimationFrame(RedibujarEnDNIEnRAF);
}

/**
	Función que vamos a llamar con un throttle de requestAnimationFrame, colapsando multiples llamadas consecutivas
	Se encarga de dibujar la copia que tenemos en BN del DNI ajustando posición y giro
*/
function RedibujarEnDNIEnRAF() {
	redibujoDNIpendiente = false;
	let canvasOrigen = imagenDNI_BN;
	// rotar ángulos rectos
	if (rotacion != 0) {
		const ancho = rotacion == 180 ? canvasOrigen.width : canvasOrigen.height;
		const alto = rotacion == 180 ? canvasOrigen.height : canvasOrigen.width;
		const canvasGiro = new OffscreenCanvas(ancho, alto);

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

		canvasOrigen = canvasGiro;
	}

	// pequeños ajustes de ángulo
	const degrees = Rotacion.value;
	if (degrees != 0) {
		const canvasAjusteAngulo = new OffscreenCanvas(canvasOrigen.width, canvasOrigen.height);

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
		canvasOrigen = canvasAjusteAngulo;
	}

	const ctx = canvas.getContext('2d', { alpha: false });

	// Borrar
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'white';
	ctx.fill();

	// volcar Imagen DNI escalada y con desplazamient
	ctx.drawImage(canvasOrigen, Horizontal.value, Vertical.value, canvas.width * Zoom.value, canvas.height * Zoom.value);
}

/** Ocultar las partes de la imagen que no hacen ninguna falta, dependerá del formato de DNI y el lado */
function DibujarMascara() {
	const bloques = FormatosDnis[Formato.value].Mascaras;

	const ctx = canvasMascara.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'black';
	bloques.forEach(bloque => ctx.fillRect(bloque.x, bloque.y, bloque.w, bloque.h));

	if (EnmascararDni.checked) {
		const bloquesDni = FormatosDnis[Formato.value].MascarasDni;
		if (bloquesDni) {
			ctx.fillStyle = 'white';
			bloquesDni.forEach(bloque => ctx.fillRect(bloque.x, bloque.y, bloque.w, bloque.h));

			let bloque = bloquesDni[0]
			if (bloque.h == 50)
				ctx.font = '74px sans-serif';
			else
				ctx.font = '82px sans-serif';
			ctx.fillStyle = 'black';
			ctx.fillText('***', bloque.x, bloque.y + bloque.h + 20);
			bloque = bloquesDni[1]
			ctx.fillText('**', bloque.x, bloque.y + bloque.h + 20);
		}
	}
}

/**
Sobre escribir texto en las zonas que se definan para el formato elegido
*/
function DibujarMarcaAgua() {
	const ctx = canvasWatermark.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
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
Combinar los 3 canvas parciales en una sola imagen para descarga canvaComposicion
*/
function ComponerImagen() {
	botonGrabar.disabled = true;

	const ctx = canvaComposicion.getContext('2d');
	ctx.drawImage(canvas, 0, 0);
	ctx.drawImage(canvasMascara, 0, 0);
	ctx.drawImage(canvasWatermark, 0, 0);

	botonGrabar.disabled = false;
}

/**
Toma el nombre de ficheo actual y lo devuelve añadiendo el sufijo ' - protegido.jpg'
*/
function GenerarNombreFichero() {
	const match = nombreFichero.match(/([^\/\\]+)(?=\.[^\.]+$)/)
	if (match)
		return match[1] + ' - protegido.jpg'

	return 'protegido.jpg';
}

function GrabarImagen() {
	const link = document.getElementById('grabar');
	link.download = GenerarNombreFichero();
	try {
		link.href = canvaComposicion.toDataURL('image/jpeg', 0.8);
		link.click();
	} catch (e) {
		alert('No se ha podido generar la imagen\r\n' + e);
	}
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

// https://gist.github.com/ahem/d19ee198565e20c6f5e1bcd8f87b3408
function createWorker(f) {
	return new Worker(URL.createObjectURL(new Blob([`(${f})()`])));
}
