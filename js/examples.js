var examples = [

{
name: "Game of Life",
width: 1024,
height:1024,
zoom: 2,
fps: 60,
pgm:`// CONWAY'S GAME OF LIFE
// https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life

// configure to binary random initial state: 10% white
setup = vec( stp(0.9, random()) );

// change mouse radius to 10 cells
pen.w = 20;

// run Conway's game of life
update = add(eql(3, V9), mlt(eql(4, V9), V));
`
},
{
name: "Sandpile",
width: 512,
height:512,
zoom: 2,
fps: 60,
pgm:`// ABELIAN SANDPILE
// https://en.wikipedia.org/wiki/Abelian_sandpile_model

// use the cursor to add sand grains

// set cursor radius
pen.w = 10;

// This model features an outer-totalistic neighbourhood
update= add(
		mlt(V, stp(V, 0.99)),
		mlt(
			0.25,
			add(
				stp(1, U(-1, 0)),
				add(
					stp(1, U(0, -1)),
					add(
						stp(1, U(1, 0)),
						stp(1, U(0, 1))
					)
				)
			)
		)
	);`
},
{
name: "Grey-Scott",
width: 1024,
height:1024,
zoom: 1,
fps: 60,
pgm:`// GREY-SCOTT REACTION DIFFUSION
// https://en.wikipedia.org/wiki/Reaction%E2%80%93diffusion_system

float diffR = 0.22;
float diffG = 0.05;
float F = 0.036;
float K = 0.061;
float rgg = V.r * V.g * V.g;
vec4 hood = V4 - V * 4.0;

update= add(frc(V), vec( diffR * hood.r  - rgg + ( F*(1.0 - V.r)), diffG * hood.g  + rgg - ( (K + F)* V.g), 0,0));
`
},
{
name: "BZ-reaction",
width: 1024,
height:1024,
zoom: 1,
fps: 60,
pgm:`// Belousov–Zhabotinsky Reaction
// https://en.wikipedia.org/wiki/Belousov%E2%80%93Zhabotinsky_reaction

// use cursor
pen.w = 20;

update= vec(sub( sub(add( div(V.x, 4.0),  div(V8.x, 4.5) ),div(V8.z, 60.0) ),  add(V.z, div(V8.x, 14.0) )),sub( div(V8.x, 8.0), mlt(V.z, 3.0)),add( mlt(sgn(V.x), 0.01), mlt(sgn(V.x), V.z)),1.0 );
`
},

{
name: "Type-C",
width: 1024,
height:1024,
zoom: 1,
fps: 60,
pgm:`update= add(
		frc(V),
		mlt(
			stp(
				0.1,
				mod(V4, 0.6)
			),
		0.6)
	)`
},

];


// TODO:



// Rule 30


// add RD parameterizartion
// http://mrob.com/pub/comp/xmorphia/
