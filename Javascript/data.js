function load(){
	loadParts();
	loadFoods();
	loadMeals();
}

var allPersons = [];

//Parts start
var allParts = [];
function loadParts(){
	//take parts-string from dataParts.js and split it by line
	var lines = partRawData.split("$");
	var header = lines[0].split(";");
	for(var i=1; i<lines.length; i++){
		//for each line (or part)
		var items = lines[i].split(";");
		// create a new Part
		var part = new Part();
		// and fill it with the according data (items)
		for(var k=0; k<header.length; k++){
			part[header[k]] = items[k];
		}
		allParts[part.part_id] = part;
	}
}
function Part(){
	this.isFood = function(){
		for(var i=0; i<this.foods.length; i++){
			if(this.foods[i].parts.length == 1)
				return this.foods[i];
		}
		return false;
	}
}

//Foods start
var allFoods = [];
function loadFoods(){
	//take foods-string from dataFoods.js and split it by line
	var lines = foodRawData.split("$");
	var header = lines[0].split(";");
	for(var i=1; i<lines.length; i++){
		//for each line (or food)
		var items = lines[i].split(";");
		// create a new Food
		var food = new Food();
		// and fill it with the according data (items)
		for(var k=0; k<header.length; k++){
			// for parts, add the actual part object instead of just the id
			if(header[k]=="parts"){
				var partReferences = [];
				//get the part ids from the "list"
				var parts = items[k].split(",");
				for(var p=0; p<parts.length; p++){
					parts[p] = parts[p].replace(" ","");
					if(allParts[parts[p]]){
						var part = allParts[parts[p]];
						partReferences.push(part);
						if(!part.foods)
							part.foods = [];
						part.foods.push(food);
					}
				}
				food["parts"] = partReferences;
			}else{
				food[header[k]] = items[k];
			}
		}
		allFoods[food.food_id] = food;
	}
}
function Food(){}


//Meals Start
var allMeals = [];
function loadMeals(){
	//take meals-string from dataMeals.js and split it by line
	var lines = mealRawData.split("$");
	var header = lines[0].split(";");
	for(var i=1; i<lines.length; i++){
		//for each line (or meal)
		var items = lines[i].split(";");
		// create a new Meal
		var meal = new Meal();
		// and fill it with the according data (items)
		for(var k=0; k<header.length; k++){
			//instead of just the food id, add an actual reference to the according food
			if(header[k]=="food"){
				var food = allFoods[items[k]];
				meal["food"] = food;
				if(food.meals)
					food.meals.push(meal);
				else
					food["meals"] = [meal];
			}else{
				meal[header[k]] = items[k];
			}
		}
		allMeals.push(meal);
		
		var person;
		if(allPersons.indexOf(meal.person)<0){
			person = new Person();
			person.meals = [];
			person.name = meal.person;
			allPersons[meal.person] = person;
		}
		else{
			person = allPersons[meal.person];
		}
		person.meals.push(meal);
	}
}
function Meal(){}
function Person(){}