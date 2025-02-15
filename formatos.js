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
	'DNI2-Frontal': {
		Nombre: 'DNI2 - Frontal',
		Mascaras: [
			{ x: 760, y: 90, w: 120, h: 50 },
			{ x: 800, y: 320, w: 170, h: 40 },// Fecha Nacimiento
			{ x: 380, y: 380, w: 400, h: 35 }, // emision, validez
			{ x: 380, y: 445, w: 400, h: 35 }, // Num Soporte, Validez
			{ x: 820, y: 420, w: 140, h: 40 },// 
			{ x: 380, y: 490, w: 400, h: 80 }, // Firma
			{ x: 780, y: 510, w: 200, h: 60 },
		],
		Watermarks: [{
			fuente: '900 48px sans-serif',
			estilo: 'rgb(0 0 0 / 100%)',
			bb: { x: 10, y: 190, w: 360, h: 490 }
		}, {
			fuente: '20px serif',
			estilo: 'rgb(0 0 0 / 30%)',
			bb: { x: 560, y: 180, w: 420, h: 170 }
		}]
	},
	'DNI2-Trasera': {
			// fixme, ¿dónde hay un ejemplo?
		Nombre: 'DNI2 - Trasera',
		Mascaras: [
			{ x: 100, y: 100, w: 120, h: 40 },
		],
		Watermarks: [{
			fuente: '12px serif',
			estilo: 'rgb(0 0 0 / 30%)',
			bb: { x: 10, y: 70, w: 980, h: 100 }
		}]
	},
	'DNI3-Frontal': {
		Nombre: 'DNI3 - Frontal',
		Mascaras: [
			{ x: 290, y: 300, w: 230, h: 35 }, // Fecha nacimiento
			{ x: 290, y: 350, w: 230, h: 35 }, // Esp
			{ x: 290, y: 400, w: 230, h: 35 }, // Validez
			{ x: 290, y: 440, w: 410, h: 170 }, // Firma
			{ x: 130, y: 430, w: 140, h: 80 }, 
		],
		Watermarks: [{
			fuente: '900 48px sans-serif',
			estilo: 'rgb(0 0 0 / 100%)',
			bb: { x: 700, y: 340, w: 290, h: 310 }
		}, {
			fuente: '20px serif',
			estilo: 'rgb(0 0 0 / 30%)',
			bb: { x: 530, y: 80, w: 450, h: 240 }
		}]
	},
	'DNI3-Trasera': {
		Nombre: 'DNI3 - Trasera',
		Mascaras: [
			{ x: 50, y: 45, w: 400, h: 40 },// Nacimiento
			{ x: 50, y: 150, w: 400, h: 40 },// Padres
			{ x: 620, y: 330, w: 280, h: 40 }, // Equipo
			{ x: 20, y: 410, w: 960, h: 120 }, // Inferior
		],
		Watermarks: [{
			fuente: '12px serif',
			estilo: 'rgb(0 0 0 / 30%)',
			bb: { x: 10, y: 70, w: 980, h: 100 }
		}]
	},
};
