/**
Código específico para la página de pruebas
*/
'use strict';

const imgs = querySelector_Array('#Ejemplos img');

imgs.forEach(imagenDemo => {
	imagenDemo.title = imagenDemo.alt;
	imagenDemo.addEventListener('click', CambiarImagenTest);
});


function CambiarImagenTest(ev) {
	const actual = document.querySelector('.Elegida');
	if (actual)
		actual.classList.remove('Elegida');

	const imagen = ev.target;
	imagen.classList.add('Elegida');
	img.onload = function() {
		const ancho = img.width;
		const alto = img.height;
		const ratio = ancho / alto;
		canvas.height = canvas.width * alto / ancho;

		const src = imagen.src;
		// si vemos que coincide con el nombre de un formato, seleccionarlo automáticamente
		const re = /ejemplos\/(.*)\.webp/;
		const match = re.exec(src);
		if (match) {
			Formato.value = match[1];
		}

		RedibujarComposicion();

		// Pasar al paso 2 y probar movimiento
		document.getElementById('paso2').open = true;
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


