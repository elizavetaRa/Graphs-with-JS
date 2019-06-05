var attraction = 0.03;
var repulsion = 2050;
var dampen = .1;
var allForceNodes = [];
var averagingCount = 8;
var transparencyValue = 0.40;

function ForceNode(x, y, pinned, div){
	allForceNodes.push(this);
	this.x = x;
	this.y = y;
	this.drawX = x;
	this.drawY = y;
	this.forceMulti = 1;
	this.localRepulsion = 1;
	this.forceX = 0;
	this.forceY = 0;
	this.pinned = pinned;
	this.neighbors = [];
	this.forceGroup = [];
	this.div = div;
	this.div.style.left = -this.div.clientWidth/2+"px";
	
	if(this.div.classList+"" == "person")
		this.div.style.top = -this.div.clientHeight/2+"px";
	
	this.remove = function(){
		this.div.parentNode.removeChild(this.div);
		allForceNodes.splice(allForceNodes.indexOf(this),1);
		for(var i=0; i<this.neighbors.length; i++){
			
			var neigh = this.neighbors[i];
			if(!typeof neigh == Person)
				neigh.neighbors.splice(this, 1);
		}
	}
	
	this.updatePosition = function(){
		if (this.pinned){
			//this.div.style.left = this.drawX+"px";
			//this.div.style.top = this.drawY+"px";
			this.div.style.transform = "translate("+this.drawX+"px,"+this.drawY+"px)";
			return;
		}

		for (var i = 0; i < this.neighbors.length; i++) {
			var neighbor = this.neighbors[i];
			var dx = (this.x - neighbor.x);
			var dy = (this.y - neighbor.y);
			var distSqr = distanceSquare(dx, dy);
			var dist = Math.sqrt(distSqr);
			var forceMult = 1;
			if(this.forceMulti != neighbor.forceMulti && (this.div.classList+"").indexOf("person")<0 && (neighbor.div.classList+"").indexOf("person")<0)
				forceMult = Math.pow(this.forceMulti * neighbor.forceMulti,3)
			var force = attraction * dist * forceMult;
			
			this.forceX -= dx * force;
			this.forceY -= dy * force;

		}
		
		var neighborInfluence = 0;
		for(var i=0; i<this.neighbors.length; i++){
			neighborInfluence += parseFloat(this.neighbors[i].forceMulti);
		}

		for (var i = 0; i < this.forceGroup.length; i++) {
			var node = this.forceGroup[i];
			if (node === this)
				continue;
			var dx = (this.x - node.x) * displayScale;
			var dy = (this.y - node.y) * displayScale;
			if (dx == 0 || dy == 0) {
				dx += 0.5 - Math.random();
				dy += 0.5 - Math.random();
			}
			var dist = distanceSquare(dx, dy);
			
			var forceMult = 1;
			if(this.forceMulti != node.forceMulti && (this.div.classList+"").indexOf("person")<0 && (node.div.classList+"").indexOf("person")<0)
				forceMult = Math.pow(this.forceMulti * node.forceMulti,3)
			
			if(dist<400*400){
				var force = forceMult * this.localRepulsion * node.localRepulsion * repulsion * Math.pow(neighborInfluence,3) / dist;
				this.forceX += dx * force;
				this.forceY += dy * force;
				
			}
		}
		this.updateDiv();
	}
	
	this.lastPositions = [];
	this.updateDiv = function(){
		
		if(this.div.node!=null && this.div.node.constructor.name=="Food" && isLensShowing()){
			if(this.div.node.expanded){
				this.div.oncliq();
			}
			var lensRect = document.getElementById("lens").getBoundingClientRect();
			var isVegetarian = this.div.node.vegetarian;
			
				var inright = this.drawX<lensRect.right;
				var inleft = this.drawX>lensRect.left;
				var intop = this.drawY>lensRect.top;
				var inbottom = this.drawY<lensRect.bottom;
				if(inleft && inright && inbottom && intop){	// node inside the lense
					if(document.getElementById("radioVeg").checked){
						if(isVegetarian.toLowerCase()=="ja"){	// and vegetarian
							this.div.getElementsByClassName("label")[0].style.background = "LightGreen ";
						}
						else{									// inside but not vegetarian
							//this.div.style.opacity = transparencyValue;
							this.div.getElementsByClassName("label")[0].style.background = "rgba(200,200,200,0.8)";
						}
					}
					else{
						this.div.getElementsByClassName("label")[0].style.background = "rgba(200,200,200,0.8)";
					}
					if(document.getElementById("radioTime").checked){
						for(var i=0; i<this.div.node.meals.length; i++){
							var meal = this.div.node.meals[i];
							if(!isInTimeFrame(meal.time)){
								this.div.style.opacity = transparencyValue;
							}
							else{
								this.div.style.opacity = 1;
							}
						}
					}
					else{
						this.div.style.opacity = 1;
					}
				}
				else{										// outside the lens
					this.div.style.opacity = 1;
					this.div.getElementsByClassName("label")[0].style.background = "rgba(200,200,200,0.8)";
				}
				if(!isLensShowing())
				this.forceMulti = this.div.style.opacity;
			
		}
		else{
			if(expandedCount>=transparencyCount && this.div.node.constructor!=Part && !this.div.node.expanded){
				if(!this.isNeighborOfFood)
					this.div.style.opacity  = transparencyValue;
			}
			else
				this.div.style.opacity = 1;
		}
		// when the lense is deactivated reset the color of nodes
		if(this.div.node!=null && this.div.node.constructor.name=="Food" && !isLensShowing()){
			this.div.getElementsByClassName("label")[0].style.background = "rgba(200,200,200,0.8)";
		}
		
		if(this.pinned){
			return;
		}
		this.forceX = (this.forceX<0?-1:1)*Math.sqrt(Math.abs(this.forceX));
		this.forceY = (this.forceY<0?-1:1)*Math.sqrt(Math.abs(this.forceY));
		this.x+=this.forceX*dampen;
		this.y+=this.forceY*dampen;
		this.x = Math.max(this.div.clientWidth/2, Math.min(viewport.width, this.x));
		this.y = Math.max(20, Math.min(viewport.height, this.y));
		
		if(this.lastPositions.length == averagingCount)
			this.lastPositions.shift();
		this.lastPositions.push({x:this.x, y:this.y});
		
		this.drawX = 0;
		this.drawY = 0;
		for(var i=0; i<this.lastPositions.length; i++){
			this.drawX+=this.lastPositions[i].x;
			this.drawY+=this.lastPositions[i].y;
		}
		this.drawX/=this.lastPositions.length;
		this.drawY/=this.lastPositions.length;
		
		this.div.style.transform = "translate("+this.drawX+"px,"+this.drawY+"px)";

		this.forceX=0;
		this.forceY=0;
		
	}
	
	this.drawConnections = function(){
		for(var i in this.neighbors){
			var alpha = 1;
			var neigh = this.neighbors[i];
			
			if(expandedCount>=transparencyCount){
				var neigh = this.neighbors[i];
				if(this.div.node.constructor==Food && !this.div.node.expanded && !neigh.isNeighborOfFood){
					alpha = transparencyValue;
					this.forceMulti = alpha;
				}
				else
				if(neigh.div.node && neigh.div.node.constructor==Food && !neigh.div.node.expanded && !neigh.isNeighborOfFood){
					alpha = transparencyValue;
				}
			}
			
			alpha = Math.min(alpha, Math.min(this.div.style.opacity, neigh.div.style.opacity));
			ctx.globalAlpha = alpha;
			if(this.neighbors[i].div.person)
				ctx.strokeStyle=this.neighbors[i].div.person.color;
			else{
				
				ctx.strokeStyle="black";
				}
			ctx.beginPath();
			ctx.lineWidth=3;
			ctx.moveTo(this.drawX, this.drawY);
			ctx.lineTo(this.neighbors[i].drawX, this.neighbors[i].drawY);
			ctx.stroke();
		}
	}
}