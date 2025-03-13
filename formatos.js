// Conjunto con objetos que definen los datos para cada formato de DNI
// .Mascaras: los rectángulos a ocultar con negro
// .Watermarks: array de objetos que definen fuente, estilo y rectángulo a rellenar con el watermark elegido
const FormatosDnis = {
	'-': {
		Nombre: ' ', // Sin máscara
		Mascaras: [
		],
		Watermarks: [{
			fuente: '20px serif',
			estilo: 'rgb(0 0 0 / 30%)',
			bb: { x: 10, y: 30, w: 980, h: 605 }
		}]
	},
	'dni4-frontal': {
		Nombre: 'DNI Frontal (v4.0 desde 2021)', 
		Mascaras: [
			{ x: 760, y: 90, w: 120, h: 50 },
			{ x: 790, y: 320, w: 180, h: 40 },// Fecha Nacimiento
			{ x: 380, y: 380, w: 400, h: 35 }, // emision, validez
			{ x: 380, y: 445, w: 400, h: 35 }, // Num Soporte, Validez
			{ x: 820, y: 420, w: 140, h: 40 },// 
			{ x: 380, y: 490, w: 400, h: 80 }, // Firma
			{ x: 780, y: 510, w: 200, h: 60 },
		],
		MascarasDni: [
			{ x: 440, y: 100, w: 110, h: 55 },//Nº DNI 4 dígitos
			{ x: 680, y: 100, w: 65, h: 55 }, //ampliado a final DNI
			{ x: 20, y: 115, w: 160, h: 35 }, //DNI miniatura
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
	'dni4-trasera': {
		Nombre: 'DNI Trasera (v4.0 desde 2021)',
		Mascaras: [
			{ x: 110, y: 90, w: 120, h: 40 },
			{ x: 0, y: 180, w: 60, h: 190 }, // vertical
			{ x: 260, y: 210, w: 500, h: 80 }, // Nacimiento
			{ x: 260, y: 320, w: 500, h: 40 }, // Padres
			{ x: 20, y: 395, w: 960, h: 130 }, // Inferior
		],
		Watermarks: [{
			fuente: '12px serif',
			estilo: 'rgb(0 0 0 / 30%)',
			bb: { x: 10, y: 70, w: 980, h: 100 }
		}]
	},
	'dni3-frontal': {
		Nombre: 'DNI Frontal (v3.0 2015-2021)', 
		Mascaras: [
			{ x: 750, y: 80, w: 140, h: 60 },
			{ x: 380, y: 380, w: 240, h: 35 }, // Fecha Nacimiento
			{ x: 780, y: 370, w: 160, h: 45 },
			{ x: 380, y: 445, w: 400, h: 35 }, // Num Soporte, Validez
			{ x: 380, y: 500, w: 400, h: 100 }, // Firma
			{ x: 790, y: 525, w: 210, h: 75 },
		],
		MascarasDni: [
			{ x: 90, y: 550, w: 90, h: 50 }, // Inicio DNI
			{ x: 300, y: 550, w: 70, h: 50 }, // Final DNI
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
	'dni3-trasera': {
		Nombre: 'DNI Trasera (v3.0 2015-2021)',
		Mascaras: [
			{ x: 100, y: 100, w: 130, h: 40 },
			{ x: 0, y: 180, w: 60, h: 190 }, // vertical
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
	'dni1-frontal': {
		Nombre: 'DNI Frontal (v2.0 hasta 2015)',
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
	'dni1-trasera': {
		Nombre: 'DNI Trasera (v2.0 hasta 2015)',
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
