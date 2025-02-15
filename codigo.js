'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
//const ctx = canvas.getContext('2d', { willReadFrequently: true });
const img = new Image;

const SelectorFichero = document.getElementById('SelectorFichero');
const Formato = document.getElementById('Formato');
const Watermark = document.getElementById('Watermark');

const Rotacion = document.getElementById('Rotacion');
const Horizontal = document.getElementById('Horizontal');
const Vertical = document.getElementById('Vertical');
const Zoom = document.getElementById('Zoom');

SelectorFichero.addEventListener('change', function(e) {
	const fichero = e.target.files[0];
	if (fichero) {
		MostrarImagen(fichero);
	}
});

// botón "bonito" para el usuario
document.getElementById('ElegirFoto')
	.addEventListener('click', () => SelectorFichero.click());

const controles = [Formato, Watermark, Rotacion, Horizontal, Vertical, Zoom];

controles.forEach(function(control) {
	control.addEventListener('change', function(e) {
		RedibujarComposicion() ;
	});
});

canvas.addEventListener('click', GrabarImagen);

/**
 Dibujar cargar la imagen en img, redimensionar el canvas para que sea proporcional y comenzar proceso
*/
function MostrarImagen(file) {
	img.onload = function() {
		URL.revokeObjectURL(img.src)

		const ancho = img.width;
		const alto = img.height;
		const ratio = ancho / alto;
		canvas.height = canvas.width * alto / ancho;

		RedibujarComposicion() ;
	}
	img.src = URL.createObjectURL(file);
}

/**
Proceso de protección del DNI
*/
function RedibujarComposicion() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	const degrees = Rotacion.value;
	if (degrees == 0) {
		ctx.drawImage(img, Horizontal.value, Vertical.value, canvas.width * Zoom.value, canvas.height * Zoom.value);
	} else {
		// save the unrotated context of the canvas so we can restore it later
		// the alternative is to untranslate & unrotate after drawing
		ctx.save();

		// move to the center of the canvas
		ctx.translate(Horizontal.value + canvas.width / 2, Vertical.value + canvas.height / 2);

		// rotate the canvas to the specified degrees
		ctx.rotate(degrees * Math.PI / 180);

		// draw the image
		// since the context is rotated, the image will be rotated also
		ctx.drawImage(img, - (canvas.width / 2),  - (canvas.height / 2), canvas.width * Zoom.value, canvas.height * Zoom.value);

		// we’re done with the rotating so restore the unrotated context
		ctx.restore();
	}

	DibujarMascara();

	DibujarMarcaAgua();

	ConvertirBN(); 
}

/** Ocultar las partes de la imagen que no hacen ninguna falta, dependerá del formato de DNI y el lado */
function DibujarMascara() {
const todosBloques = { 
		'DNI1-Frontal': [
			{x: 750, y: 80, w: 140, h: 60},
			{x: 380, y: 380, w: 240, h: 35}, // Fecha Nacimiento
			{x: 800, y: 370, w: 140, h: 40},
			{x: 380, y: 445, w: 400, h: 35}, // Num Soporte, Validez
			{x: 380, y: 500, w: 400, h: 100}, // Firma
			{x: 790, y: 525, w: 210, h: 75},
		],
		'DNI1-Trasera': [
			{x: 100, y: 100, w: 120, h: 40},
			{x: 0, y: 190, w: 60, h: 180}, // vertical
			{x: 240, y: 210, w: 500, h: 80}, // Nacimiento
			{x: 240, y: 340, w: 500, h: 40}, // Padres
			{x: 20, y: 410, w: 960, h: 130}, // Inferior
		]
	}

	const bloques = todosBloques[Formato.value];

	ctx.fillStyle = 'black';
	bloques.forEach(bloque => ctx.fillRect(bloque.x, bloque.y, bloque.w, bloque.h));
}

function DibujarMarcaAgua() {
	const texto = Watermark.value;

	const todasMarcas = {
		'DNI1-Frontal': [{
			fuente: '900 48px sans-serif',
			estilo: 'rgb(0 0 0 / 100%)',
			bb: {x: 10, y: 140, w:350, h: 460}
		}, {
			fuente: '20px serif',
			estilo: 'rgb(0 0 0 / 30%)',
			bb: {x: 10, y: 70, w: 980, h: 60}
		}
		],
		'DNI1-Trasera': [{
			fuente: '12px serif',
			estilo: 'rgb(0 0 0 / 30%)',
			bb: {x: 10, y: 70, w: 980, h: 100}
		}
		],
	};

	const marcas = todasMarcas[Formato.value];
	marcas.forEach(marca => {
		ctx.font = marca.fuente;
		ctx.fillStyle = marca.estilo;
		RellenarTexto(texto, marca.bb.x, marca.bb.y, marca.bb.w, marca.bb.h);
	});

}

/** Escribir un texto en la zona delimitada haciendo wrap letra a letra y repitiendo hasta llenar */
function RellenarTexto(texto, x, y, maxWidth, maxHeight) {
	// Calcular altura de linea con la fuente actual
	const metrics = ctx.measureText("A");
	const lineHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
	const yMax = y + maxHeight - lineHeight;

	// Dividir el texto en letras (con un separador final para repeticiones)
    const letras = (texto + ' - ').split('');
    let line = ''; // Linea que vamos a escribir

    // bucle hasta rellenar toda la zona, vamos letra a letra
	let n = 0;
    while (true) {
		const letra = letras[n];
        // Medir la anchura que tendrá si añadimos esta letra
        const testWidth = ctx.measureText(line + letra).width;
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
        } else {
            // Si no hemos superado la anchura, la añadimos a la linea actual
            line += letra;
        }
        // cuando llegamos al final, reseteamos para volver
        if (n === letras.length - 1) 
             n = 0;
		else
			n++;
    }
}


/** Convertir todo a blanco y negro */
function ConvertirBN() {
	const w = canvas.width;
	const h = canvas.height;

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
}

function GrabarImagen() {
	const link = document.getElementById('grabar');
	link.download = 'Protegido.jpg';
	link.href = canvas.toDataURL('image/jpeg', 0.8);
	link.click();
}