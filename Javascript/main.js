var foodNodes = [];
var personNodes = [];

var canvas;
var ctx;
var mouseForceNode;

// set both to equal if transparency should only activate after all nodes have been selected, e.g. 2 - 2
var maxExpanded = 30;	// how many nodes can be expanded
var transparencyCount = 1;	// after how many expanded nodes will transparency be activated
var displayScale;
function init(){
	load();
	viewport = {width: document.getElementById("nodes").clientWidth, height: document.getElementById("nodes").clientHeight};
	
	canvas = document.getElementById("canvas");
	canvas.width=viewport.width;
	canvas.height = viewport.height;
	 
	displayScale = 1000 / Math.min(canvas.width, canvas.height);
	
	mouseForceNode = new ForceNode(0,0, true,document.createElement("div"));
	mouseForceNode.localRepulsion = 0;
	document.body.addEventListener("mousemove", mouseMov);
	
	document.getElementById("nodes").addEventListener("mousedown", mousedwn);
	document.getElementById("nodes").addEventListener("mouseup", mouseup);
	document.getElementById("nodes").addEventListener("mousemove", mousemove);
	
	document.getElementById("nodes").addEventListener("touchstart", mousedwn);
	document.getElementById("nodes").addEventListener("touchend", mouseup);
	document.getElementById("nodes").addEventListener("touchmove", mousemove);
	
	document.getElementById("lens").addEventListener("mousedown", lensDragStart);
	document.body.addEventListener("mousemove", lensDrag);
	document.getElementById("lens").addEventListener("mouseup", lensDragEnd);
	
	document.getElementById("lens").addEventListener("touchstart", lensDragStart);
	document.body.addEventListener("touchmove", lensDrag);
	document.getElementById("lens").addEventListener("touchend", lensDragEnd);
	
	ctx = canvas.getContext("2d");
	
	var i=0;
	for(var name in allPersons){
		var person = allPersons[name];
		person.div = createPersonDiv(person);
		var posX = viewport.width*0.2 + 0.6*viewport.width * (i%2);
		var posY = viewport.height*0.2 + 0.6*viewport.height * (i-i%2)/2;
		person.forceNode = new ForceNode(posX, posY, true, person.div);
		personNodes.push(person.forceNode);
		person.forceNode.updateDiv();
		i++;
	}

	for(var foodID in allFoods){
		var food = allFoods[foodID];
		food.div = createMovableNodeDiv(food);
		var posX = viewport.width * Math.random();
		var posY = viewport.height * Math.random();
		food.forceNode = new ForceNode(posX, posY, false, food.div);
		foodNodes.push(food.forceNode);
		var persons = [];
		for(var mealID in food.meals){
			var meal = food.meals[mealID];
			var personEatingThis = allPersons[meal.person];
			if(persons.indexOf(personEatingThis)<0){
				persons.push(personEatingThis);
				food.forceNode.neighbors.push(personEatingThis.forceNode);
			}

		}
	}
	for(var foodID in allFoods){
		allFoods[foodID].forceNode.forceGroup = foodNodes;
		for(var i in personNodes){
			var pers = personNodes[i];
			allFoods[foodID].forceNode.forceGroup.push(pers);
			/*var persFoods = [];
			for(mealID in pers.meals){
				var meal = pers.meals[mealID];
				if(persFoods.indexOf(meal.food)<0){
					persFoods.push(meal.food);
					allFoods[foodID].forceNode.forceGroup.push(meal.food.forceNode);
				}
			}*/
		}
	}
	
	lensSizeChange(document.getElementById("lensSize"));
	
	redraw();
}

function mouseMov(event){
	mouseForceNode.x = event.pageX;
	mouseForceNode.y = event.pageY;
	mouseForceNode.forceGroup = allForceNodes;
	for(var i=0; i<allForceNodes.length; i++){
		var node = allForceNodes[i];
		if(node.forceGroup.indexOf(mouseForceNode)<0){
			node.forceGroup.push(mouseForceNode);
		}
	}
	
}

function redraw(){
	ctx.clearRect(0,0,canvas.width, canvas.height);
	for(var i in allForceNodes){
		allForceNodes[i].updatePosition();
		allForceNodes[i].drawConnections();
	}
	
	window.setTimeout("redraw()", 10);
}


var personNumber = 0;
function createPersonDiv(person){
	var div = document.createElement("div");
	div.classList.add("person");
	div.innerHTML = person.name;
	div.person = person;
	person.color = "hsl("+(personNumber*90+305)+", 80%, 40%)";
	div.style.background = person.color;
	div.style.color="white";
	div.style.boxShadow = "inset 0 0 0 0.4vmin white, 0 0 0 0.4vmin " +person.color;
	personNumber++;
	document.getElementById("nodes").appendChild(div);
	
	return div;
}

var expandedCount = 0;
var expandedPartIDs = [];
var expandedParts = [];
var expandedPartCount = [];


function createMovableNodeDiv(node){
	var div = document.createElement("div");
	var circleDiv = document.createElement("div");
	var labelDiv = document.createElement("div");
	if(node.constructor.name=="Food")
	{	circleDiv.classList.add("food");
		// size for food nodes depending on number of parts
		
		var size1 = "2vmin";
		var size2 = "3vmin";
		var size3 = "4vmin";
		var size4 = "5vmin";
		var size5 = "6vmin";
		
		switch(node.parts.length){
			case 0: {circleDiv.style.width=size1;circleDiv.style.height=size1;}; break;
			case 1: {circleDiv.style.width=size1;circleDiv.style.height=size1;}; break;
			case 2: {circleDiv.style.width=size2;circleDiv.style.height=size2;}; break;
			case 3: {circleDiv.style.width=size2;circleDiv.style.height=size2;}; break;
			case 4: {circleDiv.style.width=size2;circleDiv.style.height=size2;}; break;
			case 5: {circleDiv.style.width=size3;circleDiv.style.height=size3;}; break;
			case 6: {circleDiv.style.width=size3;circleDiv.style.height=size3;}; break;
			case 7: {circleDiv.style.width=size3;circleDiv.style.height=size3;}; break;
			case 8: {circleDiv.style.width=size3;circleDiv.style.height=size3;}; break;
			default: {circleDiv.style.width=size4;circleDiv.style.height=size4;}; // everything bigger than 8
		}
	}
	else{
		circleDiv.classList.add("part");
	}
	if(node.parts && node.parts.length==1){
		circleDiv.classList.add("singleton");
	}
	labelDiv.classList.add("label");
	div.classList.add("nodeContainer");
	labelDiv.innerHTML = node.name;
	div.appendChild(circleDiv);
	div.appendChild(labelDiv);
	div.node = node;
	
	if(node.constructor.name == "Food"){
		
		//plus Sign
		/*var plusDiv = document.createElement("div");
		plusDiv.innerHTML="+";
		plusDiv.classList.add("plus");
		circleDiv.appendChild(plusDiv);*/
		
		div.oncliq = function(){
			var node = div.node;
			if(node.expanded){
				
					node.div.getElementsByClassName("food")[0].classList.remove("active");
					node.expanded = false;
					node.forceNode.forceMulti = 1;
					for(var i=0; i<allForceNodes.length; i++)
						allForceNodes[i].forceMulti = 1;
					//node.div.getElementsByClassName("plus")[0].style.display="block";
					expandedCount--;
				node.forceNode.localRepulsion = 1;
					for(var i=0; i<node.nodeParts.length; i++){
						var nodePart = node.nodeParts[i];
						if(!nodePart.div.node)
							continue;
						var expandedPartIndex = expandedPartIDs.indexOf(nodePart.div.node.part_id);
						expandedPartCount[expandedPartIndex]--;
						if(expandedPartCount[expandedPartIndex] == 0){
							var expandedPart = expandedParts[expandedPartIndex];
							expandedPart.forceNode.remove();
							expandedPartCount.splice(expandedPartIndex,1);
							expandedPartIDs.splice(expandedPartIndex,1);
							expandedParts.splice(expandedPartIndex,1);
							
						}
					}
					
					for(var i=node.forceNode.neighbors.length-1; i>=0; i--){
						var neighbr = node.forceNode.neighbors[i];
						if(neighbr.div.className!="person"){
							node.forceNode.neighbors.splice(i, 1);
							neighbr.isNeighborOfFood = false;
						}
					}
				
					
			}
			else
				if(node.parts.length>1 && expandedCount<maxExpanded){
					node.forceNode.localRepulsion = 3;
					node.div.getElementsByClassName("food")[0].classList.add("active");
					node.expanded = true;
					node.forceNode.forceMulti = 1;
					//node.div.getElementsByClassName("plus")[0].style.display="none";
					expandedCount++;
					var nodeParts = [];
					
					
					for(var i in node.parts){
						
						
						var part = node.parts[i];
						var expandedPartIndex = expandedPartIDs.indexOf(part.part_id);
						if(expandedPartIndex<0){
							var food = part.isFood();
							if(food){
								node.forceNode.neighbors.push(food.forceNode);
								food.forceNode.isNeighborOfFood = true;
								continue;
							}
							else{
								expandedPartIDs.push(part.part_id);
								expandedParts.push(part);
								expandedPartCount.push(1);
								var partDiv = createMovableNodeDiv(part);
								
								//partDiv.childNodes[0].style.background = part.color;
								//partDiv.childNodes[0].style.backgroundSize = "contain";
								//partDiv.childNodes[0].style.backgroundImage = "url(\"carrot.png\")";
								
								// set Icon for parts
								partDiv.firstChild.style.backgroundImage = "url(\"categories_pics/"+part.category+".png\")";
								
								part.forceNode = new ForceNode(node.forceNode.x, node.forceNode.y, false, partDiv);
							
							
								for(var foodID = 0; foodID<part.foods.length; foodID++){
									var foodNode = part.foods[foodID].forceNode;
									if(foodNode.div.node.parts.length==1){
										foodNode.neighbors.push(node.forceNode);
										part = foodNode.div.node;
										break;
									}
									else
										part.forceNode.neighbors.push(foodNode);
								}
							}
						}
						else{
							expandedPartCount[expandedPartIndex]++;
							part.forceNode.neighbors.push(node.div.node.forceNode);
						}
						nodeParts.push(part.forceNode);
					}
					for(var i in nodeParts){
						nodeParts[i].forceGroup = nodeParts;
						nodeParts[i].forceGroup.push(node.forceNode);
					}
					node.nodeParts = nodeParts;
				}
				else{//Food has only one 
					div.firstChild.classList.toggle("part");
					div.firstChild.style.backgroundImage = "url(\"categories_pics/"+node.parts[0].category+".png\")";
				}
		}
	}
	
	document.getElementById("nodes").appendChild(div);
	
	return div;
}
var selectedNode = null;
var startNodePoint;
var eventStartPoint;
var clickStartTime = 0;
function mousedwn(event){
	event.preventDefault();
	console.log("mouseDown");
	if(selectedNode!=null){
		
		selectedNode.forceNode.pinned = false;
	}
	try{
		var target = event.target;
		while(target.node==null && target != document.body)
			target = target.parentNode;
		if(target == document.body){
			mouseForceNode.localRepulsion = 10;
			return;
		}
		clickStartTime = new Date().getTime();
		selectedNode = target.node;
		selectedNode.forceNode.pinned = true;
		startNodePoint = [selectedNode.forceNode.x, selectedNode.forceNode.y];
		eventStartPoint = [event.pageX, event.pageY];
	}catch(e){
		console.log(e);
	}
	event.stopPropagation();
}

function mouseup(event){
	console.log("mouseUp");
	mouseForceNode.localRepulsion = 0;
	if(selectedNode!=null){
		selectedNode.forceNode.pinned = false;
		selectedNode.forceNode.lastPositions = [];
		var target = event.target;
		while(target.node==null && target != document.body)
			target = target.parentNode;
		var currentClickTime = new Date().getTime();
		if(currentClickTime - clickStartTime<200)
			selectedNode.div.oncliq();
			
	}
	else{
		
	}
	
	
	selectedNode = null;
	event.stopPropagation();
}

function mousemove(event){
	if(selectedNode){
		selectedNode.forceNode.x = startNodePoint[0] + event.pageX - eventStartPoint[0];
		selectedNode.forceNode.y = startNodePoint[1] + event.pageY - eventStartPoint[1];
		selectedNode.forceNode.drawX = selectedNode.forceNode.x;
		selectedNode.forceNode.drawY = selectedNode.forceNode.y;
		
	}
}

function menuToggle(){
	document.getElementById("menu");
	if(menu.expanded){
		menu.expanded=false;
		menu.style.left="100%";
	}
	else{
		menu.expanded = true;
		menu.style.left= window.innerWidth-menu.clientWidth+"px";
	}
}

function lensSizeChange(elm){
	document.getElementById("lens").style.width=elm.value+"%";
	document.getElementById("lens").style.height=elm.value+"%";
	document.getElementById("lensSizeLabel").innerHTML = elm.value+"%";
}

function showLens(){
	var lens = document.getElementById("lens").style;
	if(isLensShowing()){
		lens.display="block";
	}
	else
		lens.display="none";
	if(document.getElementById("radioTime").checked){
		document.getElementById("startTime").disabled = false;
		document.getElementById("endTime").disabled = false;
	}
	else{
		document.getElementById("startTime").disabled = true;
		document.getElementById("endTime").disabled = true;
	}
}

var startTime = 0;
var endTime = 0;

function lensTimeFrameChange(){

	var startSlider = document.getElementById("startTime");
	var endSlider = document.getElementById("endTime");
	
	var labelStart = document.getElementById("startTimeLabel");
	var labelEnd = document.getElementById("endTimeLabel");
	
	labelStart.innerHTML = startSlider.value+":00 Uhr";
	if(endSlider.value==0)
		labelEnd.innerHTML = "23:59 Uhr";
	else
		labelEnd.innerHTML = endSlider.value-1 + ":59 Uhr";
		
	startTime = parseInt(startSlider.value);
	endTime = parseInt(endSlider.value);
}

var lensStartPos;
var lensDragStartPos;
var lensDragging = false;
function lensDragStart(event){
	event.stopPropagation();
	event.preventDefault();
	lensDragging = true;
	var lens = document.getElementById("lens");
	lensStartPos = [lens.getBoundingClientRect().left, lens.getBoundingClientRect().top];
	lensDragStartPos = [event.pageX,event.pageY];
}

function isInTimeFrame(string){
	var hours = parseInt(string.split(":")[0]);
	if(startTime==endTime)
		return true;
	if(startTime<endTime){
		if(hours>startTime && hours<endTime)
			return true;
	}
	else{
		if(hours>startTime || hours<endTime)
			return true;
	}
	return false;
}

function lensDrag(event){
	
	if(!lensDragging)
		return;
		
	event.stopPropagation();
	event.preventDefault();
	var lensStyle = document.getElementById("lens").style;
	lensStyle.left = lensStartPos[0] + event.pageX - lensDragStartPos[0]+"px";
	lensStyle.top = lensStartPos[1] + event.pageY - lensDragStartPos[1]+"px";
}
function lensDragEnd(event){
	lensDragging=false;
}

function isLensShowing(){
	return document.getElementById("checkLens").checked;
}

function transparencyChange(elm){
	transparencyValue = elm.value/100;
	document.getElementById("transparencyLabel").innerHTML = elm.value + "%";
}	