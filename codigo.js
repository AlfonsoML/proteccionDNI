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
const NumeroSoporte = document.getElementById('NumeroSoporte');
const DivNumeroSoporte = document.getElementById('DivNumeroSoporte');

let nombreFichero = '';

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

[Formato, EnmascararDni, NumeroSoporte].forEach(function (control) {
	control.addEventListener('change', function (e) {
		if (e.target == Formato) {
			// ajustar visibilidad del checkbox de enmascarar DNI dependiendo de si el formato muestra el DNI o no
			const formato = FormatosDnis[Formato.value];
			DivMascaraDni.style.display = formato.MascarasDni ? '' : 'none';
			DivNumeroSoporte.style.display = formato.NumeroSoporte ? '' : 'none';
		}

		DibujarMascara();
		DibujarMarcaAgua();
	});
});

[Rotacion, Horizontal, Vertical, Zoom].forEach(function (control) {
	control.addEventListener('input', function (e) {
		RedibujarDNI();
		AjustarVisibilidadResetear();
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

configurarDD(document.body);

let btnCompartir;
configurarCompartir();

activarClickConTeclado(document.getElementById('cerrar'), () => DesactivarModoEdicion());

initGestures();

configurarPantallaCompleta();

// Abrir información de ayuda al pulsar el enlace
querySelector_Array('.AbrirInfo')
	.forEach(elmto => {
		activarClickConTeclado(elmto, (target) => {
			DesactivarModoEdicion();
			const info = document.querySelector(target.getAttribute('href'));
			info.open = true;
			setTimeout(() => info.scrollIntoView({ behavior: 'smooth' }), 500);
		});
	});

// desactivar modo edición al pulsar Esc
document.body
	.addEventListener('keydown', e => {
		if (e.key == 'Escape') {
			DesactivarModoEdicion();
		}
	});

const Resetear = document.getElementById('Resetear');
activarClickConTeclado(Resetear, () => {
	ResetearControles();
	RedibujarDNI();
	AjustarVisibilidadResetear();
});

//////////////////////////////////////
//
// Definición de funciones
//
//////////////////////////////////////

function ActivarModoEdicion() {
	document.body.classList.add('Editando');
	// Que no se salga el teclado a elementos no visibles
	querySelector_Array('.informacion, footer')
		.forEach(bloque => bloque.inert = true);
}

function DesactivarModoEdicion() {
	document.body.classList.remove('Editando');
	// Restaurar interactividad
	querySelector_Array('.informacion, footer')
		.forEach(bloque => bloque.inert = false);
}

/**
Permitir ver el DNI a pantalla completa para facilitar ajustes de zoom y posición
*/
function configurarPantallaCompleta() {
	activarClickConTeclado(document.getElementById('Expandir'), () => {
		// añadimos una clase para ocultar el resto de elementos de la página en cualquier caso
		document.body.classList.add('EnZoom');

		// y le pedimos al usuario a ver si nos permite usar la pantalla completa real
		if (document.body.requestFullscreen)
			document.body.requestFullscreen();
	});

	activarClickConTeclado(document.getElementById('Colapsar'), () => {
		document.body.classList.remove('EnZoom');

		if (document.fullscreenElement)
			document.exitFullscreen();
	});
}
/**
 * Detecta click o que activamos un elemento mediante el teclado con espacio o la tecla de enteer 
 * @param {any} elmto
 * @param {any} callback
 */
function activarClickConTeclado(elmto, callback) {
	elmto.tabIndex = '0';
	elmto.addEventListener('keydown', function (ev) {
		if (ev.key == 'Enter' || ev.key == ' ')
			callback(ev.currentTarget);
	});
	elmto.addEventListener('click', ev => callback(ev.currentTarget));
}

function configurarWizard() {
	querySelector_Array('.step-name')
		.forEach(elmto => {
			activarClickConTeclado(elmto, target => activarWizard(target.parentNode))
		});

	querySelector_Array('.step > .node')
		.forEach(elmto => elmto.addEventListener('click', function (ev) {
			activarWizard(ev.target.parentNode);
		})
		);

	querySelector_Array('.Siguiente button')
		.forEach(btn => btn.addEventListener('click', function (ev) {
			const siguiente = ev.currentTarget.dataset.siguiente;
			activarWizard(document.getElementById('step' + siguiente));
		})
		);
}

function activarWizard(step) {
	ActivarModoEdicion();

	const paso = step.id.substr(4); // ej: step4

	const actual = document.querySelector('.in-progress');
	const pasoActual = actual.id.substring(4);

	if (paso == pasoActual) {
		if (paso == '1')
			SelectorFichero.click();

		return;
	}

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

	setTimeout(() => activarElementoWizard(paso), 50);
}

/**
	Poner el foco en el elemento adecuado al pasar en cada elemento del wizard
*/
function activarElementoWizard(paso) {
	switch (paso) {
		//		case '1':
		//			SelectorFichero.click();
		//			break;

		case '2':
			Formato.focus();
			break;

		case '3':
			Zoom.focus();
			break;

		case '4':
			Watermark.focus();
			break;

		case '5':
			botonGrabar.focus();
			break;

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
	const sp = new URLSearchParams(location.search)
	const sufijo = sp.has('para') ? sp.get('para') : '…';
	input.value = `Copia ${hoy.toISOString().substring(0, 10)} para ${sufijo}`;
}

/**
Giros de 90º del DNI
*/
function configurarGiro() {
	const botones = querySelector_Array('.girar');
	botones.forEach(boton => boton.addEventListener('click', girarDNI));
}

function girarDNI(ev) {
	const boton = ev.currentTarget;
	const giro = parseInt(boton.dataset.giro, 10);
	rotacion += giro;
	if (rotacion >= 360)
		rotacion -= 360;
	if (rotacion < 0)
		rotacion += 360;

	RedibujarDNI();
	AjustarVisibilidadResetear();
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
		AjustarVisibilidadResetear();

		PrepararDNI(img)
			.then(() => {
				RedibujarDNI();
				activarWizard(document.getElementById('step2'));
			});

		DibujarMascara();

		DibujarMarcaAgua();
	}
	img.onerror = function (e) {
		console.log(e);
		alert('Por favor, escoge una imagen válida');
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

			// Vamos a intentar calcular si puede interesar hacer zoom y desplazar
			const altoEscalado = canvas.width * imagenDNI_BN.height / imagenDNI_BN.width;

			if (altoEscalado < canvas.height) {
				Zoom.value = canvas.height / altoEscalado;
				Horizontal.value = (canvas.width - canvas.width * Zoom.value) / 2;
			}

			resolve();
		}

		procesadorDNI.addEventListener('message', handler, { once: true });

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

function AjustarVisibilidadResetear() {
	const Movido = rotacion != 0 || [Rotacion, Horizontal, Vertical, Zoom]
		.some((control) => control.value != control.defaultValue);

	Resetear.style.display = Movido ? '' : 'none';
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
		ctxRotado.clearRect(0, 0, ancho, alto);
		// save the unrotated context of the canvas so we can restore it later
		// the alternative is to untranslate & unrotate after drawing
		ctxRotado.save();

		// move to the center of the canvas
		ctxRotado.translate(ancho / 2, alto / 2);

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

	// volcar Imagen DNI escalada y con desplazamiento
	const aspectRatio = canvasOrigen.height / canvasOrigen.width;
	ctx.drawImage(canvasOrigen, Horizontal.value, Vertical.value, canvas.width * Zoom.value, canvas.width * Zoom.value * aspectRatio);
}

/** Ocultar las partes de la imagen que no hacen ninguna falta, dependerá del formato de DNI y el lado */
function DibujarMascara() {
	function DibujarRectangulo(bloque) {
		ctx.beginPath();
		ctx.roundRect(bloque.x, bloque.y, bloque.w, bloque.h, 5);
		ctx.fill();
	}
	const DatosFormato = FormatosDnis[Formato.value];
	const bloques = DatosFormato.Mascaras;

	const ctx = canvasMascara.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'black';
	bloques.forEach(DibujarRectangulo);

	if (NumeroSoporte.checked) {
		const bloque = DatosFormato.NumeroSoporte;
		if (bloque)
			DibujarRectangulo(bloque);
	}
	if (EnmascararDni.checked) {
		const bloquesDni = DatosFormato.MascarasDni;
		if (bloquesDni) {
			ctx.fillStyle = 'white';
			bloquesDni.forEach(DibujarRectangulo);

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
	// Si ha borrado todo el texto, no escribir nada
	if (!texto)
		return;

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
	if (btnCompartir)
		btnCompartir.disabled = true;

	const ctx = canvaComposicion.getContext('2d');
	ctx.drawImage(canvas, 0, 0);
	ctx.drawImage(canvasMascara, 0, 0);
	ctx.drawImage(canvasWatermark, 0, 0);

	botonGrabar.disabled = false;
	if (btnCompartir)
		btnCompartir.disabled = false;
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
	DesactivarModoEdicion();
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

// d&d
function configurarDD(root) {
	root.addEventListener('dragenter', function (event) {
		if (!hasFiles(event))
			return;

		root.classList.add('dragover');

		// solo Chrome cambia el cursor
		// http://stackoverflow.com/questions/24000954/in-firefox-and-ie-how-can-change-the-cursor-while-dragging-over-different-target
		event.dataTransfer.dropEffect = 'copy';
	}, false);

	root.addEventListener('dragleave', function (event) {
		const dataTransfer = event.dataTransfer;
		if (!dataTransfer)
			return;

		if (event.target != root && event.srcElement != root && event.toElement != root)
			return;

		root.classList.remove('dragover');
	}, false);

	root.addEventListener('dragover', function (event) {
		if (!hasFiles(event))
			return;

		const dataTransfer = event.dataTransfer;

		// solo Chrome cambia el cursor
		// http://stackoverflow.com/questions/24000954/in-firefox-and-ie-how-can-change-the-cursor-while-dragging-over-different-target
		dataTransfer.dropEffect = 'copy';

		// evitamos que al soltar lo procese el navegador
		event.preventDefault();
	}, false);

	root.addEventListener('drop', function (event) {
		event.preventDefault();
		const dataTransfer = event.dataTransfer;
		if (!dataTransfer)
			return;

		root.classList.remove('dragover');

		const fichero = dataTransfer.files[0];
		Previsualizacion.style.display = '';

		MostrarImagen(fichero);
		nombreFichero = fichero.name;
	}, false);
}

function hasFiles(ev) {
	const data = ev.dataTransfer;

	if (!data || !data.types)
		return false;

	if (data.types.contains && data.types.contains('Files') && !data.types.contains('text/html')) return true;
	if (data.types.indexOf && data.types.indexOf('Files') != -1) return true;
	return false;
}

function configurarCompartir() {
	btnCompartir = document.getElementById('Compartir');

	if (typeof navigator.share == 'undefined')
		return;

	// Verificar si el navegador soporta compartir ficheros (Firefox no lo tiene implementado)
	if (!navigator.canShare({
		title: 'Copia de mi DNI',
		files: [new File([''], 'test.jpg', { type: 'image/jpeg' })],
	}))
		return;

	btnCompartir.style.display = 'block';
	btnCompartir.addEventListener('click', async () => {
		let dataUrl;
		try {
			dataUrl = canvaComposicion.toDataURL('image/jpeg', 0.8);
		} catch (e) {
			alert('No se ha podido generar la imagen\r\n' + e);
		}

		const blob = await (await fetch(dataUrl)).blob();
		const file = new File(
			[blob],
			GenerarNombreFichero(),
			{
				type: 'image/jpeg',
			}
		);
		const shareData = {
			title: 'Copia de mi DNI',
			text: 'Adjunto la copia de mi DNI para su uso exclusivo',
			files: [file],
		}
		try {
			await navigator.share(shareData)
		} catch (err) {
			alert('Error: ' + err);
		}
		DesactivarModoEdicion();
	});

}

/*
Touch gestures https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures
*/

// Global vars to cache event state
const evCache = [];

// Distancia inicial entre los dos dedos para operación de zoom con pinch
let distanciaInicial;
// Valor inicial de zoom para ajustarlo con pinch
let zoomInicial;

// Punto inicial de referencia para las operaciones de panning
let puntoInicial;
// valores iniciales de desplazamiento al iniciar el panning
let desplazamientoInicial;

// Para las operaciones de mover la imagen necesitamos tener en cuenta la escala con la que se está mostrando en pantalla
// internamente son 1000px, pero si estamos en móvil o en pantalla completa la anchura será distinta
let escalaImagen;

/**
 * Calcula la distancia actual entre los dos dedos
 * @returns
 */
function calcularDistancia() {
	const toque0 = evCache[0];
	const toque1 = evCache[1];

	const dx = toque1.clientX - toque0.clientX;
	const dy = toque1.clientY - toque0.clientY;
	return Math.sqrt(dx * dx + dy * dy);
}

function initGestures() {
	// Install event handlers for the pointer target
	const el = Previsualizacion;
	el.onpointerdown = pointerdownHandler;
	el.onpointermove = pointermoveHandler;

	// Use same handler for pointer{up,cancel,out,leave} events since
	// the semantics for these events - in this app - are the same.
	el.onpointerup = pointerupHandler;
	el.onpointercancel = pointerupHandler;
	el.onpointerout = pointerupHandler;
	el.onpointerleave = pointerupHandler;
}

function pointerdownHandler(ev) {
	// The pointerdown event signals the start of a touch interaction.
	// This event is cached to support 2-finger gestures
	evCache.push(ev);

	if (evCache.length == 2) {
		// registrar datos iniciales para cambio de zoom
		distanciaInicial = calcularDistancia();
		zoomInicial = Zoom.valueAsNumber;
	}
	if (evCache.length == 1)
		registrarUnPunto(ev);
}

function registrarUnPunto(ev) {
	puntoInicial = {
		x: ev.clientX,
		y: ev.clientY,
	}
	desplazamientoInicial = {
		x: Horizontal.valueAsNumber,
		y: Vertical.valueAsNumber,
	};
	escalaImagen = canvas.width / canvas.getBoundingClientRect().width;
}

function pointermoveHandler(ev) {
	// This function implements a 2-pointer horizontal pinch/zoom gesture.

	// Find this event in the cache and update its record with this event
	const index = evCache.findIndex(
		(cachedEv) => cachedEv.pointerId === ev.pointerId,
	);
	evCache[index] = ev;

	// If two pointers are down, check for pinch gestures
	if (evCache.length === 2) {
		var cambioDistancia = calcularDistancia() - distanciaInicial;
		ActualizarValorInput(Zoom, zoomInicial + cambioDistancia * 0.01);
	}

	// desplazamiento Horizontal/Vertical
	if (evCache.length == 1) {
		ActualizarValorInput(Horizontal, desplazamientoInicial.x + escalaImagen * (ev.clientX - puntoInicial.x));

		ActualizarValorInput(Vertical, desplazamientoInicial.y + escalaImagen * (ev.clientY - puntoInicial.y));
	}
}

function pointerupHandler(ev) {
	// Remove this pointer from the cache 
	const index = evCache.findIndex(
		(cachedEv) => cachedEv.pointerId === ev.pointerId,
	);
	evCache.splice(index, 1);

	if (evCache.length == 1)
		registrarUnPunto(evCache[0]);
}

function ActualizarValorInput(input, value) {
	input.value = value;
	input.dispatchEvent(new Event('input'));
	input.dispatchEvent(new Event('change'));
}