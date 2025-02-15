// Conjunto con objetos que definen los datos para cada formato de DNI
// .Mascaras: los rectángulos a ocultar con negro
// .Watermarks: array de objetos que definen fuente, estilo y rectángulo a rellenar con el watermark elegido
const FormatosDnis = {
	'DNI1-Frontal': {
		Nombre: 'DNI1 - Frontal',
		Mascaras: [
			{ x: 750, y: 80, w: 140, h: 60 },
			{ x: 380, y: 380, w: 240, h: 35 }, // Fecha Nacimiento
			{ x: 800, y: 370, w: 140, h: 40 },
			{ x: 380, y: 445, w: 400, h: 35 }, // Num Soporte, Validez
			{ x: 380, y: 500, w: 400, h: 100 }, // Firma
			{ x: 790, y: 525, w: 210, h: 75 },
		],
		Watermarks: [{
			fuente: '900 48px sans-serif',
			estilo: 'rgb(0 0 0 / 100%)',
			bb: { x: 10, y: 140, w: 350, h: 460 }
		}, {
			fuente: '20px serif',
			estilo: 'rgb(0 0 0 / 30%)',
			bb: { x: 10, y: 70, w: 980, h: 60 }
		}]
	},
	'DNI1-Trasera': {
		Nombre: 'DNI1 - Trasera',
		Mascaras: [
			{ x: 100, y: 100, w: 120, h: 40 },
			{ x: 0, y: 190, w: 60, h: 180 }, // vertical
			{ x: 240, y: 210, w: 500, h: 80 }, // Nacimiento
			{ x: 240, y: 340, w: 500, h: 40 }, // Padres
			{ x: 20, y: 410, w: 960, h: 130 }, // Inferior
		],
		Watermarks: [{
			fuente: '12px serif',
			estilo: 'rgb(0 0 0 / 30%)',
			bb: { x: 10, y: 70, w: 980, h: 100 }
		}]
	},
};
