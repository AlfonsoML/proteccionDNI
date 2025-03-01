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

	const img = ev.target;
	img.classList.add('Elegida');

	nombreFichero = img.src;

	ResetearControles();
	Previsualizacion.style.display = '';

	const src = img.src;
	// si vemos que coincide con el nombre de un formato, seleccionarlo automáticamente
	const re = /ejemplos\/(.*)\.webp/;
	const match = re.exec(src);
	if (match) {
		Formato.value = match[1];
	}

	if (nombreFichero.startsWith('file:')) 	{
		const canvasTmp = new OffscreenCanvas(img.naturalWidth, img.naturalHeight);

		const ctxImagen = canvasTmp.getContext('2d');
		ctxImagen.drawImage(img, 0, 0);

		imagenDNI_BN = canvasTmp.transferToImageBitmap();
		
		RedibujarDNI();
		activarWizard(document.getElementById('step2'));
	} else {
		PrepararDNI(img)
			.then( () => {
				RedibujarDNI();
				activarWizard(document.getElementById('step2'));
		});
	}

	DibujarMascara();

	DibujarMarcaAgua();

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


