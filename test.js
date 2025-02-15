/**
Código específico para la página de pruebas
*/
'use strict';

const imgs = querySelector_Array('#Ejemplos img');

imgs.forEach(imagenDemo => imagenDemo.addEventListener('click', CambiarImagenTest));


function CambiarImagenTest(ev) {
	const imagen = ev.target;

	img.onload = function() {
		const ancho = img.width;
		const alto = img.height;
		const ratio = ancho / alto;
		canvas.height = canvas.width * alto / ancho;

		RedibujarComposicion();
	}
	img.src = imagen.src;

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


