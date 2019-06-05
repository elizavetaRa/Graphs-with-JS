var viewport;
var foodColors = ["#FF0000", "#0000FF", "#00FF00", "#00FFFF", "#FF00FF", "#FFFF00"];


function getMinViewportDimension(){
	return Math.min(viewport.width, viewport.height);
}

function distanceSquare(dx, dy){
	return dx*dx+dy*dy;
}

function rand(round, max){
	if(max == null)
		max=1;
	if(round)
		return Math.floor(Math.random()*max);
	return Math.random()*max;
}